import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { requestId } from "./middlewares/request-id.js";
import { generalRateLimit } from "./middlewares/rate-limit.js";
import { botProtection } from "./middlewares/bot-protection.js";
import { sanitizeInput } from "./middlewares/sanitize.js";
import { httpLogger } from "./middlewares/logger.js";
import { apiRouter } from "./routes/index.js";

const app = express();

// Security: Disable x-powered-by header
app.disable("x-powered-by");

// Security: Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API (no HTML served)
    crossOriginEmbedderPolicy: false,
  })
);

// DDoS Protection: Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    // 30 second timeout
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: "Request timeout",
        requestId: req.id,
      });
    }
  });
  next();
});

// Security: CORS
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 86400, // 24 hours
  })
);

// Security: Compression
app.use(compression());

// Security: Cookie parser
app.use(cookieParser());

// Security: Body size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Request ID tracking (must be before logger)
app.use(requestId);

// Structured logging
app.use(httpLogger);

// Health check endpoint (before bot protection to allow monitoring)
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        service: "streakflow",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      requestId: req.id,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        status: "degraded",
        service: "streakflow",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      requestId: req.id,
    });
  }
});

// Security: Bot protection
app.use(botProtection);

// Security: Input sanitization
app.use(sanitizeInput);

// Security: Rate limiting
app.use(generalRateLimit);

// API routes
app.use("/api/v1", apiRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

