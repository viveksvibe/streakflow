import pino from "pino";
import { env } from "../config/env.js";

const isDevelopment = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";

const baseLogger = pino({
  level: isTest
    ? (process.env.LOG_LEVEL ?? "silent") // silent by default; LOG_LEVEL=debug to inspect
    : (env.NODE_ENV === "production" ? "info" : "debug"),
  transport: isDevelopment && !isTest
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname,service,environment",
          singleLine: true,
        },
      }
    : undefined,
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    service: "streakflow-api",
    environment: env.NODE_ENV,
  },
});

export const logger = baseLogger;
