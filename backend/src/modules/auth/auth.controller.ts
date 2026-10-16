import type {  Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../errors/app-error.js";
import { sendSuccess } from "../../utils/http-response.js";
import {
  getCurrentUserProfile,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "./auth.service.js";
import { env } from "../../config/env.js";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
};

// Implement proper cookie settings:
// Development: httpOnly: true, sameSite: "lax", secure: false
// Production: httpOnly: true, sameSite: "none", secure: true
const isProduction = env.NODE_ENV === "production";

const options: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await registerUser(req.body);

  res.cookie("refreshToken", data.tokens.refreshToken, {
    ...options,maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("accessToken", data.tokens.accessToken, {
    ...options, maxAge: 15 * 60 * 1000, // 15 minutes
  });
  sendSuccess(res, 201, data, "Account created successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await loginUser(req.body);
  res.cookie("refreshToken", data.tokens.refreshToken, {
    ...options,maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("accessToken", data.tokens.accessToken, {
    ...options, maxAge: 15 * 60 * 1000, // 15 minutes
  });
  sendSuccess(res, 200, data, "Login successful");
});


export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }
  const data = await refreshSession(refreshToken);
  res.cookie("refreshToken", data.tokens.refreshToken, {
    ...options, maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("accessToken", data.tokens.accessToken, {
    ...options, maxAge: 15 * 60 * 1000, // 15 minutes
  });
  sendSuccess(res, 200, data, "Session refreshed");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  await logoutUser(refreshToken);
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
  sendSuccess(res, 200, null, "Logged out");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCurrentUserProfile(req.user!.id);
  sendSuccess(res, 200, data);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  let avatarUrl: string | undefined;

  if (req.file) {
    const { uploadToCloudinary } = await import("../../utils/cloudinary.js");
    avatarUrl = await uploadToCloudinary(req.file.buffer, `avatars/${req.user!.id}`);
  }

  const { fullName } = req.body;
  const { updateUserProfile } = await import("./auth.service.js");
  
  const data = await updateUserProfile(req.user!.id, { fullName, avatarUrl });
  sendSuccess(res, 200, data, "Profile updated successfully");
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  const { googleLoginUser } = await import("./auth.service.js");
  const data = await googleLoginUser(accessToken);
  
  // Set refresh token in cookie
  res.cookie("refreshToken", data.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(res, 200, { user: data.user, tokens: { accessToken: data.tokens.accessToken } });
});
