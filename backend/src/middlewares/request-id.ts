import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const sanitizeRequestId = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  // Strip control characters/whitespace and cap the length so a hostile
  // client cannot inject log entries or flood storage via this header.
  const cleaned = value.replace(/[^\w-.]/g, "").slice(0, 64);
  return cleaned.length > 0 ? cleaned : null;
};

export const requestId = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.id = sanitizeRequestId(req.headers["x-request-id"]) ?? randomUUID();
  next();
};
