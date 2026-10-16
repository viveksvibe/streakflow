import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/http-response.js";
import { getActivityHeatmap, getDashboard, getHabitLeaderboard, getWeeklyProgress } from "./stats.service.js";

export const getDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getDashboard(req.user!.id);
  sendSuccess(res, 200, data);
});

export const getWeeklyProgressHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getWeeklyProgress(req.user!.id);
  sendSuccess(res, 200, data);
});

export const getActivityHeatmapHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getActivityHeatmap(req.user!.id);
  sendSuccess(res, 200, data);
});

export const getHabitLeaderboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getHabitLeaderboard(req.user!.id);
  sendSuccess(res, 200, data);
});
