#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd -- "$(git -C "$(dirname -- "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null || dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$REPO_ROOT"

echo "[post-create] Installing Node dependencies in $REPO_ROOT ..."
if [ -f package.json ]; then
  npm install
else
  echo "[post-create] No package.json found, skipping npm install."
fi
echo "[post-create] Done. Run: npm run dev"
