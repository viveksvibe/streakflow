import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { getYearMonthInTimeZone } from "../../utils/date.js";

export const getUserOrThrow = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      streakFreezeCredits: true,
      freezeCreditsResetAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const ensureMonthlyFreezeCredits = async (userOrId: string | { id: string; timezone: string; streakFreezeCredits: number; freezeCreditsResetAt: Date; email: string; fullName: string; }) => {
  const user = typeof userOrId === "string" ? await getUserOrThrow(userOrId) : userOrId;
  const now = new Date();

  const currentMonth = getYearMonthInTimeZone(now, user.timezone);
  const resetMonth = getYearMonthInTimeZone(user.freezeCreditsResetAt, user.timezone);

  if (currentMonth === resetMonth) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      streakFreezeCredits: env.MONTHLY_FREEZE_CREDITS,
      freezeCreditsResetAt: now,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      streakFreezeCredits: true,
      freezeCreditsResetAt: true,
    },
  });
};
