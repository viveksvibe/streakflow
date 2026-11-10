import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

interface RateLimitStore {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  blockDuration?: number; // How long to block after exceeding limit (ms)
}

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip || "unknown",
    skipSuccessfulRequests = false,
    blockDuration = windowMs, // Default block duration equals window
  } = options;

  // Each limiter gets its own store so that limits for different route
  // groups (e.g. auth vs general) never contaminate each other's counters.
  const store = new Map<string, RateLimitStore>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Clean up expired entries periodically
    if (store.size > 10000) {
      for (const [k, v] of store.entries()) {
        if (v.resetTime < now && (!v.blockedUntil || v.blockedUntil < now)) {
          store.delete(k);
        }
      }
    }

    const record = store.get(key);

    // Check if currently blocked
    if (record && record.blockedUntil && record.blockedUntil > now) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      logger.warn({
        msg: "Rate limit blocked",
        ip: req.ip,
        key,
        retryAfter,
        requestId: req.id,
      });
      res.set("Retry-After", retryAfter.toString());
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        retryAfter,
        requestId: req.id,
      });
    }

    // New window or no record
    if (!record || record.resetTime < now) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      // Block for specified duration
      record.blockedUntil = now + blockDuration;
      const retryAfter = Math.ceil(blockDuration / 1000);

      logger.warn({
        msg: "Rate limit exceeded - blocking",
        ip: req.ip,
        key,
        count: record.count,
        maxRequests,
        retryAfter,
        requestId: req.id,
      });

      res.set("Retry-After", retryAfter.toString());
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        retryAfter,
        requestId: req.id,
      });
    }

    record.count++;

    if (skipSuccessfulRequests) {
      // Will decrement on successful response
      res.on("finish", () => {
        if (res.statusCode < 400 && record.count > 0) {
          record.count--;
        }
      });
    }

    next();
  };
};

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  blockDuration: 30 * 60 * 1000, // Block for 30 minutes after exceeding
  keyGenerator: (req) => req.ip || "unknown",
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500, // 500 requests per 15 minutes (increased for testing)
  blockDuration: 15 * 60 * 1000, // Block for 15 minutes after exceeding
  keyGenerator: (req) => req.ip || "unknown",
});
