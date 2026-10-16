import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import {
  archiveHabitHandler,
  completeHabitTodayHandler,
  createHabitHandler,
  listHabitsHandler,
  updateHabitHandler,
  freezeHabitTodayHandler,
} from "./habit.controller.js";
import {
  archiveHabitSchema,
  completeHabitSchema,
  createHabitSchema,
  updateHabitSchema,
} from "./habit.schemas.js";

export const habitRouter = Router();

habitRouter.use(authenticate);
habitRouter.get("/", listHabitsHandler);
habitRouter.post("/", validateRequest(createHabitSchema), createHabitHandler);
habitRouter.patch("/:habitId", validateRequest(updateHabitSchema), updateHabitHandler);
habitRouter.delete("/:habitId", validateRequest(archiveHabitSchema), archiveHabitHandler);
habitRouter.post(
  "/:habitId/complete-today",
  validateRequest(completeHabitSchema),
  completeHabitTodayHandler,
);
habitRouter.post(
  "/:habitId/freeze-today",
  validateRequest(completeHabitSchema),
  freezeHabitTodayHandler,
);
