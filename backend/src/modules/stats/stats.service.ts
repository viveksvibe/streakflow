import { HabitStatus } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { addDaysToLocalDate, diffLocalDates, getTodayLocalDate } from "../../utils/date.js";
import { ensureMonthlyFreezeCredits, getUserOrThrow } from "../users/user.service.js";

const getSummaryNumbers = async (userId: string) => {
  const [totalCompletions, bestStreakAgg] = await Promise.all([
    prisma.habitCompletion.count({
      where: { userId },
    }),
    prisma.habitProgress.aggregate({
      where: {
        habit: {
          userId,
          status: HabitStatus.ACTIVE,
        },
      },
      _max: {
        bestStreak: true,
      },
    }),
  ]);

  return {
    totalCompletions,
    bestStreak: bestStreakAgg._max.bestStreak ?? 0,
  };
};

export const getWeeklyProgress = async (userId: string, timezone?: string) => {
  const tz = timezone ?? (await getUserOrThrow(userId)).timezone;
  const today = getTodayLocalDate(tz);
  const startDate = addDaysToLocalDate(today, -6);

  const [groupedCompletions, groupedFreezes] = await Promise.all([
    prisma.habitCompletion.groupBy({
      by: ["localDate"],
      where: {
        userId,
        localDate: {
          gte: startDate,
          lte: today,
        },
      },
      _count: { _all: true },
    }),
    prisma.streakFreezeUsage.groupBy({
      by: ["missedLocalDate"],
      where: {
        userId,
        missedLocalDate: {
          gte: startDate,
          lte: today,
        },
      },
      _count: { _all: true },
    }),
  ]);

  const countByDate = new Map<string, number>();
  groupedCompletions.forEach((entry) => {
    countByDate.set(entry.localDate, entry._count._all);
  });
  groupedFreezes.forEach((entry) => {
    const existing = countByDate.get(entry.missedLocalDate) ?? 0;
    countByDate.set(entry.missedLocalDate, existing + entry._count._all);
  });
  const series = Array.from({ length: 7 }, (_, offset) => {
    const date = addDaysToLocalDate(startDate, offset);
    return {
      date,
      completedHabits: countByDate.get(date) ?? 0,
    };
  });

  return {
    startDate,
    endDate: today,
    series,
  };
};

export const getActivityHeatmap = async (userId: string, timezone?: string) => {
  const tz = timezone ?? (await getUserOrThrow(userId)).timezone;
  const today = getTodayLocalDate(tz);
  const startDate = addDaysToLocalDate(today, -30);

  const [groupedCompletions, groupedFreezes] = await Promise.all([
    prisma.habitCompletion.groupBy({
      by: ["localDate"],
      where: {
        userId,
        localDate: {
          gte: startDate,
          lte: today,
        },
      },
      _count: { _all: true },
    }),
    prisma.streakFreezeUsage.groupBy({
      by: ["missedLocalDate"],
      where: {
        userId,
        missedLocalDate: {
          gte: startDate,
          lte: today,
        },
      },
      _count: { _all: true },
    }),
  ]);

  const countByDate = new Map<string, number>();
  groupedCompletions.forEach((entry) => {
    countByDate.set(entry.localDate, entry._count._all);
  });
  
  const freezeByDate = new Map<string, number>();
  groupedFreezes.forEach((entry) => {
    freezeByDate.set(entry.missedLocalDate, entry._count._all);
  });

  const activity = Array.from({ length: 31 }, (_, offset) => {
    const date = addDaysToLocalDate(startDate, offset);
    const completions = countByDate.get(date) ?? 0;
    const freezes = freezeByDate.get(date) ?? 0;

    let status = "missed";
    if (completions > 0) {
      status = "completed";
    } else if (freezes > 0) {
      status = "frozen";
    }

    return {
      date,
      completions: completions + freezes,
      status,
    };
  });

  return {
    startDate,
    endDate: today,
    activity,
  };
};

export const getHabitLeaderboard = async (userId: string) => {
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      status: HabitStatus.ACTIVE,
    },
    include: {
      progress: true,
    },
  });

  return habits
    .map((habit) => ({
      habitId: habit.id,
      name: habit.name,
      icon: habit.icon,
      currentStreak: habit.progress?.currentStreak ?? 0,
      bestStreak: habit.progress?.bestStreak ?? 0,
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak || b.bestStreak - a.bestStreak)
    .slice(0, 10);
};

export const getDashboard = async (userId: string) => {
  let user = await getUserOrThrow(userId);
  user = await ensureMonthlyFreezeCredits(user);
  const today = getTodayLocalDate(user.timezone);

  const habits = await prisma.habit.findMany({
    where: {
      userId,
      status: HabitStatus.ACTIVE,
    },
    include: {
      progress: true,
      completions: {
        where: {
          localDate: today,
        },
        select: { id: true },
      },
      freezeUsages: {
        where: {
          missedLocalDate: today,
        },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!habits) {
    throw new AppError("Unable to load dashboard", 500);
  }

  const completedToday = habits.filter((habit) => habit.completions.length > 0).length;
  const completionRate = habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100);
  const [weeklyProgress, heatmap, leaderboard, summary] = await Promise.all([
    getWeeklyProgress(userId, user.timezone),
    getActivityHeatmap(userId, user.timezone),
    getHabitLeaderboard(userId),
    getSummaryNumbers(userId),
  ]);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      timezone: user.timezone,
    },
    today: {
      localDate: today,
      completedHabits: completedToday,
      totalHabits: habits.length,
      completionRate,
    },
    habits: habits.map((habit) => {
      let currentStreak = habit.progress?.currentStreak ?? 0;
      if (habit.progress?.lastCompletedDate) {
        const dayGap = diffLocalDates(habit.progress.lastCompletedDate, today);
        if (dayGap > 2 || (dayGap === 2 && user.streakFreezeCredits <= 0)) {
          currentStreak = 0;
        }
      }

      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        completedToday: habit.completions.length > 0,
        frozenToday: habit.freezeUsages.length > 0,
        currentStreak,
        bestStreak: habit.progress?.bestStreak ?? 0,
        reminderEnabled: habit.reminderEnabled,
        reminderTime: habit.reminderTime,
      };
    }),
    streakFreeze: {
      monthlyCredits: user.streakFreezeCredits,
    },
    stats: {
      totalCompletions: summary.totalCompletions,
      bestStreak: summary.bestStreak,
      weeklyProgress: weeklyProgress.series,
      activityHeatmap: heatmap.activity,
      leaderboard,
    },
  };
};
