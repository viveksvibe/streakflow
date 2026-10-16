import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
