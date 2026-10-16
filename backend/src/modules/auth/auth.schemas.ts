import { z } from "zod";
import { isValidTimeZone } from "../../utils/date.js";

const timezoneSchema = z
  .string()
  .refine((value) => isValidTimeZone(value), "Invalid IANA timezone")
  .optional();

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(120, "Password is too long"),
    timezone: timezoneSchema,
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const googleLoginSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, "Google Access Token is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});


export const logoutSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
