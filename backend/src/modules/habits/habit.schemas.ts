import { z } from "zod";

const reminderTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Reminder time must be HH:mm")
  .nullable()
  .optional();

const createBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    icon: z.string().trim().min(1).max(8).default("✅"),
    reminderEnabled: z.boolean().default(false),
    reminderTime: reminderTimeSchema,
  })
  .refine(
    (body) => (!body.reminderEnabled ? true : Boolean(body.reminderTime)),
    "reminderTime is required when reminderEnabled is true",
  );

const updateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    icon: z.string().trim().min(1).max(8).optional(),
    reminderEnabled: z.boolean().optional(),
    reminderTime: reminderTimeSchema,
  })
  .refine(
    (body) => (body.reminderEnabled === true ? Boolean(body.reminderTime) : true),
    "reminderTime is required when reminderEnabled is true",
  );

export const createHabitSchema = z.object({
  body: createBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateHabitSchema = z.object({
  body: updateBodySchema,
  params: z.object({
    habitId: z.string().cuid(),
  }),
  query: z.object({}).optional(),
});

export const archiveHabitSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    habitId: z.string().cuid(),
  }),
  query: z.object({}).optional(),
});

export const completeHabitSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    habitId: z.string().cuid(),
  }),
  query: z.object({}).optional(),
});
