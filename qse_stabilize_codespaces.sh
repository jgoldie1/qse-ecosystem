#!/usr/bin/env bash
# qse_stabilize_codespaces.sh
# Stabilises the QSE Ecosystem dev environment (Codespaces or local).
# Safe to run multiple times (idempotent).
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "=== QSE Ecosystem – Codespace Stabiliser ==="

# 1. Create .env from example if it doesn't exist
if [ ! -f "$ROOT/.env" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "[stabilize] Created .env from .env.example"
else
  echo "[stabilize] .env already present – skipping"
fi

# 2. Install / update npm dependencies (includes bcryptjs, jsonwebtoken, cors)
echo "[stabilize] Running npm install..."
npm install

# 3. Ensure the uploads directory exists so multer can write files
UPLOADS_DIR="$ROOT/server/uploads"
if [ ! -d "$UPLOADS_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
  echo "[stabilize] Created $UPLOADS_DIR"
fi

# 4. Ensure the database directory exists
DB_DIR="$ROOT/server/data"
if [ ! -d "$DB_DIR" ]; then
  mkdir -p "$DB_DIR"
  echo "[stabilize] Created $DB_DIR"
fi

echo ""
echo "=== Stabilisation complete ==="
echo "Run 'npm run dev' to start the development server on port 5000."
