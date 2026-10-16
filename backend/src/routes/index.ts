import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { habitRouter } from "../modules/habits/habit.routes.js";
import { statsRouter } from "../modules/stats/stats.routes.js";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "StreakFlow API",
      version: "v1",
    },
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/habits", habitRouter);
apiRouter.use("/stats", statsRouter);
