import { env } from "../config/env.js";

// ANSI color codes
const magenta = "\x1b[35m";
const white = "\x1b[37m";
const reset = "\x1b[0m";

const extractDbHost = (databaseUrl: string): string => {
  try {
    // Parse postgresql://user:pass@host:port/db
    const url = new URL(databaseUrl);
    return url.hostname;
  } catch {
    return "unknown";
  }
};

const getCloudinaryStatus = () => {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    return "✓ Configured";
  }
  return "○ Not configured";
};

const getGoogleAuthStatus = () => {
  if (env.GOOGLE_CLIENT_ID) {
    return "✓ Configured";
  }
  return "○ Not configured";
};

export const logStartupInfo = (dbConnected: boolean = true) => {
  const dbHost = extractDbHost(env.DATABASE_URL);
  const nodeEnv = env.NODE_ENV.toUpperCase();

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`${white}  StreakFlow API Server${reset}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`${magenta}  Environment:${reset}`);
  console.log(`    Node Env:      ${nodeEnv}`);
  console.log(`    Port:          ${env.PORT.toString()}`);
  console.log(`${magenta}  Database:${reset}`);
  console.log(`    Host:          ${dbHost}`);
  console.log(`    Status:        ${dbConnected ? "✓ Connected" : "✗ Disconnected"}`);
  console.log(`${magenta}  Services:${reset}`);
  console.log(`    Cloudinary:    ${getCloudinaryStatus()}`);
  console.log(`    Google Auth:   ${getGoogleAuthStatus()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (dbConnected) {
    console.log(`${white}✓ Server is running on http://localhost:${env.PORT}${reset}`);
  } else {
    console.log("✗ Server failed to start - Database connection error");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
};
