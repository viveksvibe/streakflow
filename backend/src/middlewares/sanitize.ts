import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

// Basic sanitization to prevent XSS and injection attacks
const sanitizeString = (str: string): string => {
  if (typeof str !== "string") return str;

  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers like onclick=
};

const sanitizeObject = (obj: unknown): unknown => {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// AUDIT FIX [6.3 & 7.3]: Express 5 req.query is a getter; mutate properties instead of reassigning
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters without reassigning getter-only req.query
    if (req.query && typeof req.query === "object") {
      const sanitized = sanitizeObject({ ...req.query }) as Record<string, unknown>;
      for (const key of Object.keys(req.query)) {
        delete (req.query as Record<string, unknown>)[key];
      }
      Object.assign(req.query, sanitized);
    }

    // Sanitize URL parameters without reassigning getter-only req.params
    if (req.params && typeof req.params === "object") {
      const sanitized = sanitizeObject({ ...req.params }) as Record<string, unknown>;
      for (const key of Object.keys(req.params)) {
        delete (req.params as Record<string, unknown>)[key];
      }
      Object.assign(req.params, sanitized);
    }

    next();
  } catch (error) {
    logger.error({
      msg: "Sanitization error",
      error,
      requestId: req.id,
    });
    next(error);
  }
};
