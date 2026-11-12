import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { addDaysToLocalDate, getTodayLocalDate } from '../../utils/date.js';
import { HabitStatus, Prisma } from '@prisma/client';

export const createTestUser = async (overrides: Partial<Prisma.UserCreateInput> = {}) => {
  const defaultUser = {
    fullName: 'Test User',
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    passwordHash: await hashPassword('password123'),
    timezone: 'UTC',
    streakFreezeCredits: 2,
    ...overrides,
  };

  return prisma.user.create({
    data: defaultUser,
  });
};

export const createTestHabit = async (userId: string, overrides: Partial<Prisma.HabitCreateInput> = {}) => {
  const habit = await prisma.habit.create({
    data: {
      userId,
      name: 'Test Habit',
      icon: '✅',
      reminderEnabled: false,
      status: HabitStatus.ACTIVE,
      user: undefined,
      ...overrides,
      progress: {
        create: {
          currentStreak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        },
      },
    } as Prisma.HabitCreateInput,
    include: {
      progress: true,
    },
  });

  return habit;
};

/**
 * Backdate a habit's progress so streak logic can be tested without
 * waiting for real days to pass.
 */
export const setHabitProgress = async (
  habitId: string,
  progress: Prisma.HabitProgressUpdateInput,
) => {
  return prisma.habitProgress.update({
    where: { habitId },
    data: progress,
  });
};

/** Date string (YYYY-MM-DD) N days before today in the given timezone. */
export const daysAgo = (count: number, timezone: string = 'UTC') =>
  addDaysToLocalDate(getTodayLocalDate(timezone), -count);

export const cleanupTestData = async () => {
  // Clean up in order to respect foreign key constraints
  await prisma.streakFreezeUsage.deleteMany({});
  await prisma.habitCompletion.deleteMany({});
  await prisma.habitProgress.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
};

export { prisma };
