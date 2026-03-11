#!/usr/bin/env bash
set -Eeuo pipefail

echo "[post-start] Codespace is ready."
echo "[post-start] Start the server:  npm run dev"
echo "[post-start] App URL:            http://localhost:5000"
echo "[post-start] Health check:       http://localhost:5000/api/health"
