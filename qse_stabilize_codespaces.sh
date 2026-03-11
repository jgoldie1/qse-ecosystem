#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT=${PORT:-5000}

echo "[qse_stabilize] Working directory: $ROOT"

# ── 1. Install / refresh npm dependencies ───────────────────────────────────
echo "[qse_stabilize] Installing npm dependencies..."
cd "$ROOT"
npm install

# ── 2. Ensure the SQLite data directory exists ───────────────────────────────
DATA_DIR="$ROOT/server/data"
if [ ! -d "$DATA_DIR" ]; then
  echo "[qse_stabilize] Creating server/data directory..."
  mkdir -p "$DATA_DIR"
fi

# ── 3. Create .env from .env.example if no .env is present ──────────────────
if [ ! -f "$ROOT/.env" ] && [ -f "$ROOT/.env.example" ]; then
  echo "[qse_stabilize] Creating .env from .env.example..."
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

# ── 4. Free port $PORT so that 'npm run dev' can bind immediately ────────────
echo "[qse_stabilize] Checking for processes on port $PORT..."
PIDS=$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "[qse_stabilize] Stopping processes on port $PORT: $PIDS"
  for pid in $PIDS; do
    kill "$pid" 2>/dev/null || true
  done
  sleep 1
  STILL_RUNNING=$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)
  for pid in $STILL_RUNNING; do
    kill -9 "$pid" 2>/dev/null || true
  done
else
  echo "[qse_stabilize] Port $PORT is free."
fi

echo "[qse_stabilize] Done. Run 'npm run dev' to start the server."
