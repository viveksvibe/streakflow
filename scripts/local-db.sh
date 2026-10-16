#!/usr/bin/env bash
# Local development PostgreSQL helper.
# Creates and manages a user-owned Postgres cluster (no sudo, no Docker).
# Data lives outside the repo in ~/.streakflow/pgdata.
#
# Usage: bash scripts/local-db.sh {init|start|stop|status}

set -euo pipefail

PG_VERSION="${PG_VERSION:-18}"
PGBIN="/usr/lib/postgresql/${PG_VERSION}/bin"
PGDATA="${STREAKFLOW_PGDATA:-$HOME/.streakflow/pgdata}"
PGPORT="${STREAKFLOW_PGPORT:-5433}"
PGUSER="${STREAKFLOW_PGUSER:-streakflow}"
PGPASS="${STREAKFLOW_PGPASSWORD:-streakflow}"
PGDB="${STREAKFLOW_PGDATABASE:-streakflow}"

init() {
  if [ -d "$PGDATA" ]; then
    echo "Cluster already initialized at: $PGDATA"
    return 0
  fi
  mkdir -p "$(dirname "$PGDATA")"
  local pwfile
  pwfile="$(mktemp)"
  printf '%s' "$PGPASS" > "$pwfile"
  "$PGBIN/initdb" -D "$PGDATA" -U "$PGUSER" --pwfile="$pwfile" \
    --auth-local=trust --auth-host=scram-sha-256 -E UTF8
  rm -f "$pwfile"
  echo "Initialized cluster at: $PGDATA"
}

is_running() {
  "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1
}

start() {
  if [ ! -d "$PGDATA" ]; then
    echo "No cluster found at $PGDATA. Run: bash scripts/local-db.sh init" >&2
    exit 1
  fi
  if is_running; then
    echo "Already running on 127.0.0.1:$PGPORT"
  else
    "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PGDATA/server.log" \
      -o "-p $PGPORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$PGDATA" -w start
  fi
  PGPASSWORD="$PGPASS" "$PGBIN/createdb" -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER" "$PGDB" 2>/dev/null \
    && echo "Created database '$PGDB'" \
    || true
  echo "Postgres ready at 127.0.0.1:$PGPORT  (db=$PGDB user=$PGUSER)"
}

stop() {
  "$PGBIN/pg_ctl" -D "$PGDATA" -w stop
}

status() {
  "$PGBIN/pg_ctl" -D "$PGDATA" status
}

case "${1:-help}" in
  init)   init ;;
  start)  start ;;
  stop)   stop ;;
  status) status ;;
  *) echo "Usage: bash scripts/local-db.sh {init|start|stop|status}"; exit 1 ;;
esac
