import type { Habit, Prisma } from "@prisma/client";
import { HabitStatus, PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import {
  addDaysToLocalDate,
  diffLocalDates,
  getNowInTimeZone,
  getTodayLocalDate,
} from "../../utils/date.js";
import { ensureMonthlyFreezeCredits } from "../users/user.service.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

type CreateHabitPayload = {
  name: string;
  icon: string;
  reminderEnabled: boolean;
  reminderTime?: string;
};

type UpdateHabitPayload = {
  name?: string;
  icon?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
};

const habitResponse = (habit: Habit & { progress: { currentStreak: number; bestStreak: number } | null }) => ({
  id: habit.id,
  name: habit.name,
  icon: habit.icon,
  reminderEnabled: habit.reminderEnabled,
  reminderTime: habit.reminderTime,
  status: habit.status,
  currentStreak: habit.progress?.currentStreak ?? 0,
  bestStreak: habit.progress?.bestStreak ?? 0,
  createdAt: habit.createdAt,
  updatedAt: habit.updatedAt,
});

const getOwnedHabitOrThrow = async (db: DbClient, userId: string, habitId: string) => {
  const habit = await db.habit.findFirst({
    where: {
      id: habitId,
      userId,
      status: HabitStatus.ACTIVE,
    },
    include: {
      progress: true,
      user: {
        select: {
          id: true,
          timezone: true,
          streakFreezeCredits: true,
        },
      },
    },
  });

  if (!habit) {
    throw new AppError("Habit not found", 404);
  }

  return habit;
};

export const createHabit = async (userId: string, payload: CreateHabitPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: payload.name.trim(),
      icon: payload.icon.trim(),
      reminderEnabled: payload.reminderEnabled,
      reminderTime: payload.reminderEnabled ? payload.reminderTime : null,
      progress: {
        create: {
          currentStreak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        },
      },
    },
    include: {
      progress: true,
    },
  });

  return habitResponse(habit);
};

export const listHabits = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      timezone: true,
      streakFreezeCredits: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const today = getTodayLocalDate(user.timezone);
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      status: HabitStatus.ACTIVE,
    },
    include: {
      progress: true,
      completions: {
        where: { localDate: today },
        select: { id: true },
      },
      freezeUsages: {
        where: { missedLocalDate: today },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedCount = habits.filter((habit) => habit.completions.length > 0).length;
  return {
    summary: {
      localDate: today,
      totalHabits: habits.length,
      completedToday: completedCount,
    },
    habits: habits.map((habit) => {
      let currentStreak = habit.progress?.currentStreak ?? 0;
      if (habit.progress?.lastCompletedDate) {
        const dayGap = diffLocalDates(habit.progress.lastCompletedDate, today);
        // If dayGap is 0 or 1, streak is active.
        // If dayGap is 2 and they have freezes, streak is safe (will auto-freeze on completion).
        // Otherwise, the streak is broken.
        if (dayGap > 2 || (dayGap === 2 && user.streakFreezeCredits <= 0)) {
          currentStreak = 0;
        }
      }

      return {
        ...habitResponse(habit),
        currentStreak,
        completedToday: habit.completions.length > 0,
        frozenToday: habit.freezeUsages.length > 0,
      };
    }),
  };
};

export const updateHabit = async (userId: string, habitId: string, payload: UpdateHabitPayload) => {
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId,
      status: HabitStatus.ACTIVE,
    },
  });

  if (!habit) {
    throw new AppError("Habit not found", 404);
  }

  const updated = await prisma.habit.update({
    where: { id: habitId },
    data: {
      name: payload.name?.trim(),
      icon: payload.icon?.trim(),
      reminderEnabled: payload.reminderEnabled,
      reminderTime:
        payload.reminderEnabled === false
          ? null
          : payload.reminderTime === undefined
            ? habit.reminderTime
            : payload.reminderTime,
    },
    include: {
      progress: true,
    },
  });

  return habitResponse(updated);
};

export const archiveHabit = async (userId: string, habitId: string) => {
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId,
      status: HabitStatus.ACTIVE,
    },
    select: { id: true },
  });

  if (!habit) {
    throw new AppError("Habit not found", 404);
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: { status: HabitStatus.ARCHIVED },
  });
};

export const completeHabitForToday = async (userId: string, habitId: string) => {
  await ensureMonthlyFreezeCredits(userId);

  const result = await prisma.$transaction(async (tx) => {
    const habit = await getOwnedHabitOrThrow(tx, userId, habitId);
    const today = getNowInTimeZone(habit.user.timezone);

    const existingCompletion = await tx.habitCompletion.findUnique({
      where: {
        habitId_localDate: {
          habitId,
          localDate: today.localDate,
        },
      },
    });

    if (existingCompletion) {
      return {
        alreadyCompleted: true,
        localDate: today.localDate,
        currentStreak: habit.progress?.currentStreak ?? 0,
        bestStreak: habit.progress?.bestStreak ?? 0,
        consumedFreeze: false,
        remainingFreezes: habit.user.streakFreezeCredits,
      };
    }

    await tx.habitCompletion.create({
      data: {
        userId,
        habitId,
        localDate: today.localDate,
        timezone: habit.user.timezone,
      },
    });

    const existingProgress = habit.progress;
    let nextCurrentStreak = 1;
    let nextBestStreak = Math.max(existingProgress?.bestStreak ?? 0, 1);
    let consumedFreeze = false;
    let remainingFreezes = habit.user.streakFreezeCredits;

    if (existingProgress?.lastCompletedDate) {
      const dayGap = diffLocalDates(existingProgress.lastCompletedDate, today.localDate);

      if (dayGap === 1) {
        nextCurrentStreak = existingProgress.currentStreak + 1;
      } else if (dayGap === 2 && habit.user.streakFreezeCredits > 0) {
        consumedFreeze = true;
        nextCurrentStreak = existingProgress.currentStreak + 1;
        remainingFreezes -= 1;

        await tx.user.update({
          where: { id: userId },
          data: {
            streakFreezeCredits: {
              decrement: 1,
            },
          },
        });

        await tx.streakFreezeUsage.create({
          data: {
            userId,
            habitId,
            missedLocalDate: addDaysToLocalDate(existingProgress.lastCompletedDate, 1),
          },
        });
      } else if (dayGap <= 0) {
        nextCurrentStreak = existingProgress.currentStreak;
      }
    }

    nextBestStreak = Math.max(existingProgress?.bestStreak ?? 0, nextCurrentStreak);

    await tx.habitProgress.upsert({
      where: { habitId },
      create: {
        habitId,
        currentStreak: nextCurrentStreak,
        bestStreak: nextBestStreak,
        lastCompletedDate: today.localDate,
      },
      update: {
        currentStreak: nextCurrentStreak,
        bestStreak: nextBestStreak,
        lastCompletedDate: today.localDate,
      },
    });

    return {
      alreadyCompleted: false,
      localDate: today.localDate,
      currentStreak: nextCurrentStreak,
      bestStreak: nextBestStreak,
      consumedFreeze,
      remainingFreezes,
      monthlyFreezeAllocation: env.MONTHLY_FREEZE_CREDITS,
    };
  });

  return result;
};

export const freezeHabitForToday = async (userId: string, habitId: string) => {
  await ensureMonthlyFreezeCredits(userId);

  return await prisma.$transaction(async (tx) => {
    const habit = await getOwnedHabitOrThrow(tx, userId, habitId);
    const today = getNowInTimeZone(habit.user.timezone);

    if (habit.user.streakFreezeCredits <= 0) {
      throw new AppError("No streak freeze credits left", 400);
    }

    const existingCompletion = await tx.habitCompletion.findUnique({
      where: {
        habitId_localDate: {
          habitId,
          localDate: today.localDate,
        },
      },
    });

    if (existingCompletion) {
      throw new AppError("Habit already completed today", 400);
    }

    const existingFreeze = await tx.streakFreezeUsage.findFirst({
      where: {
        habitId,
        missedLocalDate: today.localDate,
      },
    });

    if (existingFreeze) {
      throw new AppError("Streak freeze already used for today", 400);
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        streakFreezeCredits: {
          decrement: 1,
        },
      },
    });

    await tx.streakFreezeUsage.create({
      data: {
        userId,
        habitId,
        missedLocalDate: today.localDate,
      },
    });

    const existingProgress = habit.progress;
    let currentStreak = existingProgress?.currentStreak ?? 0;
    let bestStreak = existingProgress?.bestStreak ?? 0;

    // Check if the streak is already broken before freezing today
    if (existingProgress?.lastCompletedDate) {
      const dayGap = diffLocalDates(existingProgress.lastCompletedDate, today.localDate);
      // A dayGap of 1 means they completed it yesterday, so freezing today is valid to maintain the streak.
      // If dayGap > 1, they missed yesterday. Since they are freezing today, yesterday remains missed.
      // So the streak is irrevocably broken.
      if (dayGap > 1) {
        currentStreak = 0;
      }
    }

    bestStreak = Math.max(bestStreak, currentStreak);

    await tx.habitProgress.upsert({
      where: { habitId },
      create: {
        habitId,
        currentStreak,
        bestStreak,
        lastCompletedDate: today.localDate,
      },
      update: {
        currentStreak,
        bestStreak,
        lastCompletedDate: today.localDate,
      },
    });

    return {
      success: true,
      remainingFreezes: habit.user.streakFreezeCredits - 1,
      localDate: today.localDate,
    };
  });
};
