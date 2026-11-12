import type { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { hashToken } from "../../utils/token.js";
import crypto from "crypto";

type DbClient = PrismaClient | Prisma.TransactionClient;

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  timezone?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const sanitizeUser = (user: {
  id: string;
  fullName: string;
  email: string;
  timezone: string;
  streakFreezeCredits: number;
  avatarUrl?: string | null;
  createdAt: Date;
}) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  timezone: user.timezone,
  streakFreezeCredits: user.streakFreezeCredits,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

const issueTokenPair = async (
  db: DbClient,
  user: { id: string; email: string },
) => {
  // A nonce guarantees each refresh token (and therefore its stored hash)
  // is unique even when signed within the same second as a previous one.
  const nonce = crypto.randomUUID();
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, nonce });
  const refreshPayload = verifyRefreshToken(refreshToken);

  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(refreshPayload.exp * 1000),
    },
  });

  return { accessToken, refreshToken };
};

export const registerUser = async (payload: RegisterPayload) => {
  const email = payload.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  try {
    // Create the user and their refresh token atomically so a failure
    // mid-way cannot leave a user without valid tokens behind.
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: payload.fullName.trim(),
          email,
          passwordHash: await hashPassword(payload.password),
          timezone: payload.timezone ?? "UTC",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          timezone: true,
          streakFreezeCredits: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const tokens = await issueTokenPair(tx, user);
      return { user: sanitizeUser(user), tokens };
    });
  } catch (error) {
    // Concurrent registrations for the same email lose the unique-index race.
    if ((error as { code?: string })?.code === "P2002") {
      throw new AppError("Email is already in use", 409);
    }
    throw error;
  }
};

// Comparing against this instead of returning early hides whether an email
// exists from timing-based user enumeration.
let dummyHashPromise: Promise<string> | null = null;
const getDummyPasswordHash = () => {
  dummyHashPromise ??= hashPassword(crypto.randomBytes(18).toString("hex"));
  return dummyHashPromise;
};

export const loginUser = async (payload: LoginPayload) => {
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      passwordHash: true,
      streakFreezeCredits: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    await comparePassword(payload.password, await getDummyPasswordHash());
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await comparePassword(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const tokens = await issueTokenPair(prisma, user);
  return { user: sanitizeUser(user), tokens };
};

export const refreshSession = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  // Rotate atomically: the presented token is revoked and replaced in one
  // transaction so a replayed token can never yield two live sessions.
  return await prisma.$transaction(async (tx) => {
    const storedToken = await tx.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            timezone: true,
            streakFreezeCredits: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token is invalid or expired", 401);
    }

    if (storedToken.userId !== payload.sub) {
      throw new AppError("Refresh token mismatch", 401);
    }

    const newRefreshToken = signRefreshToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      nonce: crypto.randomUUID(),
    });
    const newRefreshPayload = verifyRefreshToken(newRefreshToken);

    await tx.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    await tx.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(newRefreshPayload.exp * 1000),
      },
    });

    const accessToken = signAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
    });

    return {
      user: sanitizeUser(storedToken.user),
      tokens: { accessToken, refreshToken: newRefreshToken },
    };
  });
};

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
};

export const getCurrentUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      streakFreezeCredits: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

export const updateUserProfile = async (
  userId: string,
  payload: { fullName?: string; avatarUrl?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.fullName && { fullName: payload.fullName.trim() }),
      ...(payload.avatarUrl && { avatarUrl: payload.avatarUrl }),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      streakFreezeCredits: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return sanitizeUser(user);
};

export const googleLoginUser = async (accessToken: string) => {
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new AppError("Could not verify Google access token", 401);
  }

  if (!response.ok) {
    throw new AppError("Invalid Google Access Token", 401);
  }

  const payload = await response.json().catch(() => null);

  if (!payload || !payload.email || typeof payload.email !== "string") {
    throw new AppError("Could not retrieve email from Google", 401);
  }

  const email = payload.email.trim().toLowerCase();
  const picture = typeof payload.picture === "string" ? payload.picture : null;
  const name = typeof payload.name === "string" && payload.name.trim().length > 0 ? payload.name : "Google User";
  
  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      timezone: true,
      passwordHash: true,
      streakFreezeCredits: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  
  if (!user) {
    // Register new user via Google
    const randomPassword = crypto.randomBytes(32).toString('hex');
    try {
      user = await prisma.user.create({
        data: {
          fullName: name,
          email,
          passwordHash: await hashPassword(randomPassword),
          timezone: "UTC",
          avatarUrl: picture,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          timezone: true,
          passwordHash: true,
          streakFreezeCredits: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
    } catch (error) {
      // A concurrent Google login may have created the user first.
      if ((error as { code?: string })?.code !== "P2002") {
        throw error;
      }
      const existing = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          fullName: true,
          email: true,
          timezone: true,
          passwordHash: true,
          streakFreezeCredits: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      if (!existing) {
        throw new AppError("Could not create account from Google profile", 500);
      }
      user = existing;
    }
  } else {
    if (!user.avatarUrl && picture) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: picture },
      });
      user.avatarUrl = picture;
    }
  }

  const tokens = await issueTokenPair(prisma, user);
  return { user: sanitizeUser(user), tokens };
};
