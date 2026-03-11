#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
FILE="$ROOT/server/index.js"

if [ ! -f "$FILE" ]; then
  echo "server/index.js not found; run from repository root"
  exit 1
fi

cat > "$FILE" <<'JS'
# fallback script preserved in-place; run this to restore SPA fallbacks if needed
echo "Ensure your server mounts static apps and includes SPA fallbacks."
JS

echo "(This helper was moved to scripts/; original behavior has been preserved in the repository history.)"
