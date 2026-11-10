import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

// Common bot user agents to block
const BLOCKED_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /wget/i,
  /python/i,
  /java/i,
  /go-http/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

// Suspicious patterns in user agent
const SUSPICIOUS_PATTERNS = [
  /sqlmap/i,
  /nmap/i,
  /metasploit/i,
  /burp/i,
  /nikto/i,
  /zap/i,
];

export const botProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userAgent = req.headers["user-agent"] || "";

  // Check for blocked user agents
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      logger.warn({
        msg: "Blocked request - suspicious user agent",
        userAgent,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied",
        requestId: req.id,
      });
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      logger.warn({
        msg: "Blocked request - malicious tool detected",
        userAgent,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied",
        requestId: req.id,
      });
    }
  }

  // Check for missing user agent (suspicious for API requests)
  if (!userAgent && req.path.startsWith("/api")) {
    logger.warn({
      msg: "Blocked request - missing user agent",
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(403).json({
      success: false,
      message: "Access denied",
      requestId: req.id,
    });
  }

  next();
};
