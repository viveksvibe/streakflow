import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logStartupInfo } from "./utils/startup-logger.js";

app.listen(env.PORT, "0.0.0.0", async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    logStartupInfo(true);
  } catch (error) {
    logStartupInfo(false);
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
});

