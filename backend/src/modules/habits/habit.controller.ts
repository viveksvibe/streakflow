import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/http-response.js";
import {
  archiveHabit,
  completeHabitForToday,
  createHabit,
  listHabits,
  updateHabit,
  freezeHabitForToday,
} from "./habit.service.js";

export const createHabitHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await createHabit(req.user!.id, req.body);
  sendSuccess(res, 201, data, "Habit created");
});

export const listHabitsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await listHabits(req.user!.id);
  sendSuccess(res, 200, data);
});

export const updateHabitHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateHabit(req.user!.id, String(req.params.habitId), req.body);
  sendSuccess(res, 200, data, "Habit updated");
});

export const archiveHabitHandler = asyncHandler(async (req: Request, res: Response) => {
  await archiveHabit(req.user!.id, String(req.params.habitId));
  sendSuccess(res, 200, null, "Habit archived");
});

export const completeHabitTodayHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await completeHabitForToday(req.user!.id, String(req.params.habitId));
  sendSuccess(res, 200, data, "Habit marked complete for today");
});

export const freezeHabitTodayHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await freezeHabitForToday(req.user!.id, String(req.params.habitId));
  sendSuccess(res, 200, data, "Streak freeze applied for today");
});
