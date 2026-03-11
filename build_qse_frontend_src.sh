#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  QSE Ecosystem — Frontend Build"
echo "============================================"

# ── Root dependencies ─────────────────────────
echo ""
echo "Installing root dependencies..."
cd "$ROOT_DIR"
npm install
echo "Root dependencies installed."

# ── Helper: build a React app ─────────────────
build_app() {
  local name="$1"
  local dir="$2"

  echo ""
  echo "--------------------------------------------"
  echo "  Building: $name"
  echo "--------------------------------------------"
  cd "$ROOT_DIR/$dir"
  npm install
  npm run build
  echo "$name build complete → $dir/dist/"
}

# ── Build each frontend app ───────────────────
build_app "Sculptify App"    "apps/sculptify-app"
build_app "March & Lewis App" "apps/march-lewis-app"

echo ""
echo "============================================"
echo "  All frontend builds completed successfully"
echo "============================================"
