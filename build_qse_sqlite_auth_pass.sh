#!/usr/bin/env bash
# build_qse_sqlite_auth_pass.sh
# Ensures all SQLite + auth dependencies are installed and the server is ready to run.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Installing / updating npm dependencies..."
npm install jsonwebtoken bcryptjs cors

echo "==> Ensuring server/data directory exists..."
mkdir -p server/data

echo ""
echo "✅ Build complete. Start the server with:"
echo "   npm run dev"
echo ""
echo "Then open:"
echo "   http://localhost:5000/api/health"
echo "   http://localhost:5000/login"
echo "   http://localhost:5000/admin"
