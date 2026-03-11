#!/usr/bin/env bash
# qse_stabilize_codespaces.sh
# One-shot bootstrap + health-check for GitHub Codespaces (and local dev).
# Usage: bash qse_stabilize_codespaces.sh
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=${PORT:-5000}
LOG=/tmp/qse_dev.log

echo "[qse_stabilize] Working directory: $ROOT"
cd "$ROOT"

# ── 1. Environment file ──────────────────────────────────────────────────────
if [ ! -f "$ROOT/.env" ]; then
  if [ -f "$ROOT/.env.example" ]; then
    cp "$ROOT/.env.example" "$ROOT/.env"
    echo "[qse_stabilize] Copied .env.example → .env"
  else
    echo "[qse_stabilize] WARNING: .env.example not found; .env not created"
  fi
else
  echo "[qse_stabilize] .env already exists – skipping copy"
fi

# ── 2. Node modules ──────────────────────────────────────────────────────────
if [ ! -d "$ROOT/node_modules" ]; then
  echo "[qse_stabilize] node_modules not found – running npm install..."
  npm install
else
  echo "[qse_stabilize] node_modules present – skipping npm install"
fi

# ── 3. Free port $PORT ───────────────────────────────────────────────────────
echo "[qse_stabilize] Checking for processes on port $PORT..."
pids=$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$pids" ]; then
  echo "[qse_stabilize] Killing existing processes on port $PORT: $pids"
  for pid in $pids; do
    kill -9 "$pid" || true
  done
  sleep 1
else
  echo "[qse_stabilize] Port $PORT is free"
fi

# ── 4. Start dev server ──────────────────────────────────────────────────────
echo "[qse_stabilize] Starting dev server (PORT=$PORT) – logging to $LOG..."
PORT=$PORT npm run dev >"$LOG" 2>&1 &
DEV_PID=$!
echo "[qse_stabilize] Dev server PID: $DEV_PID"

# ── 5. Wait for /health ──────────────────────────────────────────────────────
echo "[qse_stabilize] Waiting for http://localhost:$PORT/health ..."
for i in $(seq 1 60); do
  if curl -sf --max-time 1 "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo "[qse_stabilize] ✓ Server is up on port $PORT"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "[qse_stabilize] ✗ Server did not respond within 30 s. Last log output:"
    tail -n 40 "$LOG" || true
    exit 1
  fi
  sleep 0.5
done

# ── 6. Print available URLs ──────────────────────────────────────────────────
echo ""
echo "[qse_stabilize] Available endpoints:"
echo "  http://localhost:$PORT/health"
echo "  http://localhost:$PORT/sculptify"
echo "  http://localhost:$PORT/march-lewis"
echo "  http://localhost:$PORT/api/sculptify"
echo "  http://localhost:$PORT/api/march-lewis"
echo "  http://localhost:$PORT/api/auth"
echo ""
echo "[qse_stabilize] Codespace is stable. Press Ctrl-C to stop the server."

wait "$DEV_PID"
