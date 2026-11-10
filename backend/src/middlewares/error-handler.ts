import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { logger } from "../lib/logger.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.id || "unknown";

  if (error instanceof ZodError) {
    const errorMessages = error.issues.map((issue) => issue.message).join(", ");
    logger.warn({
      msg: "Validation error",
      requestId,
      errors: error.issues,
      path: req.path,
      method: req.method,
    });
    return res.status(400).json({
      success: false,
      message: errorMessages,
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      requestId,
    });
  }

  // AUDIT FIX [7.3]: Handle AppError and any custom error carrying a statusCode
  const potentialStatusCode =
    error instanceof AppError
      ? error.statusCode
      : typeof error === "object" && error !== null && "statusCode" in error && typeof (error as { statusCode: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : null;

  if (potentialStatusCode !== null) {
    const errorDetails = error instanceof AppError ? error.details : (error as { details?: unknown }).details;
    const errorMessage = error instanceof Error ? error.message : "Application error";

    logger.warn({
      msg: "Application error",
      requestId,
      statusCode: potentialStatusCode,
      errorMessage,
      path: req.path,
      method: req.method,
    });
    return res.status(potentialStatusCode).json({
      success: false,
      message: errorMessage,
      details: errorDetails,
      requestId,
    });
  }

  // Malformed request bodies (e.g. invalid JSON) are client errors.
  const errorType = (error as { type?: string } | null)?.type;
  if (errorType === "entity.too.large") {
    logger.warn({
      msg: "Request body too large",
      requestId,
      path: req.path,
      method: req.method,
    });
    return res.status(413).json({
      success: false,
      message: "Request body too large",
      requestId,
    });
  }

  if (
    (error instanceof SyntaxError && (error as { status?: number }).status === 400) ||
    errorType === "entity.parse.failed"
  ) {
    logger.warn({
      msg: "Malformed request body",
      requestId,
      path: req.path,
      method: req.method,
    });
    return res.status(400).json({
      success: false,
      message: "Malformed request body",
      requestId,
    });
  }

  logger.error({
    msg: "Unexpected error",
    requestId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    requestId,
  });
};
