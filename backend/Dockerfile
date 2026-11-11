# ─── Stage 1: Builder ──────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL and certificates required by Prisma
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDependencies for TypeScript compilation)
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# Copy TypeScript configuration and source files
COPY tsconfig*.json ./
COPY src ./src

# Compile TypeScript to dist/
RUN npm run build

# Remove development dependencies to keep production bundle lean
RUN npm prune --omit=dev


# ─── Stage 2: Production Runner ────────────────────────────────
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Install runtime dependencies: OpenSSL (for Prisma) and curl (for container HEALTHCHECK)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package manifests, entrypoint, schema, and config
COPY package*.json ./
COPY docker-entrypoint.sh ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy built artifacts and pruned production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Ensure executable permissions on entrypoint script and directory ownership for node user
RUN chmod +x ./docker-entrypoint.sh && \
    chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
