#!/usr/bin/env bash
# dev-reset.sh — stop any running dev server, clean up, and restart
set -Eeuo pipefail

REPO_ROOT="$(cd -- "$(git -C "$(dirname -- "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null || dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$REPO_ROOT"

PORT="${PORT:-5000}"

echo "[dev-reset] Stopping any process on port $PORT ..."
if command -v lsof >/dev/null 2>&1; then
  pids=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "[dev-reset] Killing PIDs: $pids"
    for pid in $pids; do
      kill "$pid" 2>/dev/null || true
    done
  fi
fi

echo "[dev-reset] Reinstalling dependencies ..."
npm install

echo "[dev-reset] Starting dev server ..."
npm run dev
