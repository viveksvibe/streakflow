import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";
import { ensureMonthlyFreezeCredits } from "../modules/users/user.service.js";
import { verifyAccessToken } from "../utils/jwt.js";

const getBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req.headers.authorization) || req.cookies?.accessToken;
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        timezone: true,
        streakFreezeCredits: true,
        freezeCreditsResetAt: true,
      },
    });

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const updatedUser = await ensureMonthlyFreezeCredits(user);

    req.user = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      timezone: updatedUser.timezone,
    };
    next();
  } catch (error) {
    next(error);
  }
};
