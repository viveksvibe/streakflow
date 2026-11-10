import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../lib/logger.js";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  logger.warn({
    msg: "Route not found",
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
  });
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
