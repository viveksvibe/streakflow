import { pinoHttp } from "pino-http";
import type { Request } from "express";
import { logger } from "../lib/logger.js";

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (res: any, err: any) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    }
    if (res.statusCode >= 500 || err) {
      return "error";
    }
    return "info";
  },
  customProps: (req: Request) => ({
    requestId: req.id,
  }),
});
