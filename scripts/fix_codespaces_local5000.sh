#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
PORT=${PORT:-5000}

echo "[fix_codespaces_local5000] Working directory: $ROOT"
echo "[fix_codespaces_local5000] Ensuring port $PORT is free..."

pids=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$pids" ]; then
  echo "[fix_codespaces_local5000] Killing processes on port $PORT: $pids"
  for pid in $pids; do
    kill -9 "$pid" || true
  done
else
  echo "[fix_codespaces_local5000] No processes found on port $PORT"
fi

LOG=/tmp/qse_dev.log
echo "[fix_codespaces_local5000] Starting dev server (PORT=$PORT)..."
PORT=$PORT npm run dev &>"$LOG" &
DEV_PID=$!
echo "[fix_codespaces_local5000] Dev process PID: $DEV_PID (logging to $LOG)"

echo "[fix_codespaces_local5000] Waiting for server to respond on http://localhost:$PORT/health"
for i in $(seq 1 40); do
  if curl -sS --max-time 1 "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo "[fix_codespaces_local5000] Server is up at http://localhost:$PORT"
    echo "[fix_codespaces_local5000] Fetching /march-lewis/ preview (first 120 lines):"
    curl -sS --max-time 5 "http://localhost:$PORT/march-lewis/" | sed -n '1,120p'
    exit 0
  fi
  sleep 0.5
done

echo "[fix_codespaces_local5000] Server did not respond within timeout. Showing last 200 lines of log ($LOG):"
tail -n 200 "$LOG" || true
exit 1
