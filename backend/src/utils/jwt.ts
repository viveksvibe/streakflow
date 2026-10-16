import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

type AccessPayload = {
  sub: string;
  email: string;
};

type RefreshPayload = {
  sub: string;
  email: string;
};

type TokenPayload = jwt.JwtPayload & {
  sub: string;
  email: string;
  exp: number;
};

const parsePayload = (decoded: string | jwt.JwtPayload): TokenPayload => {
  if (typeof decoded === "string") {
    throw new AppError("Token payload is invalid", 401);
  }

  if (!decoded.sub || !decoded.email || !decoded.exp) {
    throw new AppError("Token payload is incomplete", 401);
  }

  return decoded as TokenPayload;
};

export const signAccessToken = (payload: AccessPayload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as any,
  });
};

export const signRefreshToken = (payload: RefreshPayload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return parsePayload(decoded);
  } catch {
    throw new AppError("Access token is invalid or expired", 401);
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return parsePayload(decoded);
  } catch {
    throw new AppError("Refresh token is invalid or expired", 401);
  }
};
