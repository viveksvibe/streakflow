export const createTestUser: (overrides?: any) => Promise<any>;
export const createTestHabit: (userId: string, overrides?: any) => Promise<any>;
export const setHabitProgress: (
  habitId: string,
  progress: { currentStreak?: number; bestStreak?: number; lastCompletedDate?: string | null }
) => Promise<any>;
export const daysAgo: (count: number, timezone?: string) => string;
export const cleanupTestData: () => Promise<void>;
export const prisma: any;
