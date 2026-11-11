#!/bin/sh
set -e

# Automatically run database migrations if RUN_MIGRATIONS is true
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[entrypoint] RUN_MIGRATIONS=true: applying database migrations..."
  npx prisma migrate deploy
  echo "[entrypoint] Database migrations applied successfully."
fi

exec "$@"
