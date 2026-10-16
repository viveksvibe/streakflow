import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getActivityHeatmapHandler,
  getDashboardHandler,
  getHabitLeaderboardHandler,
  getWeeklyProgressHandler,
} from "./stats.controller.js";

export const statsRouter = Router();

statsRouter.use(authenticate);
statsRouter.get("/dashboard", getDashboardHandler);
statsRouter.get("/weekly-progress", getWeeklyProgressHandler);
statsRouter.get("/activity-heatmap", getActivityHeatmapHandler);
statsRouter.get("/habit-leaderboard", getHabitLeaderboardHandler);
