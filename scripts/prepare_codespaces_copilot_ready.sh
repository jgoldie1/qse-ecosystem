#!/usr/bin/env bash
# prepare_codespaces_copilot_ready.sh
# Prepares the QSE Ecosystem Codespace to be GitHub Copilot-ready.
# Run from the repository root: bash scripts/prepare_codespaces_copilot_ready.sh
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> QSE Ecosystem: preparing Copilot-ready Codespace..."

# 1. Install npm dependencies
echo "--> Installing npm dependencies..."
npm install

# 2. Ensure .env exists (copy from .env.example if missing)
if [ ! -f "$ROOT/.env" ]; then
  if [ -f "$ROOT/.env.example" ]; then
    cp "$ROOT/.env.example" "$ROOT/.env"
    echo "--> Created .env from .env.example (update secrets before use)"
  else
    echo "--> WARNING: .env.example not found; skipping .env creation"
  fi
else
  echo "--> .env already exists, skipping"
fi

# 3. Ensure devcontainer.json forwards the correct port (5000)
DEVCONTAINER="$ROOT/.devcontainer/devcontainer.json"
if [ -f "$DEVCONTAINER" ]; then
  if ! grep -q '"5000"' "$DEVCONTAINER" && ! grep -q '5000' "$DEVCONTAINER"; then
    echo "--> WARNING: $DEVCONTAINER does not forward port 5000; consider updating forwardPorts"
  else
    echo "--> devcontainer.json port 5000 confirmed"
  fi
fi

# 4. Ensure .github/copilot-instructions.md exists
COPILOT_INSTRUCTIONS="$ROOT/.github/copilot-instructions.md"
if [ -f "$COPILOT_INSTRUCTIONS" ]; then
  echo "--> .github/copilot-instructions.md found"
else
  echo "--> WARNING: $COPILOT_INSTRUCTIONS not found; Copilot context will be limited"
fi

# 5. Smoke-test: confirm server entry point exists
if [ -f "$ROOT/server/index.js" ]; then
  echo "--> server/index.js confirmed"
else
  echo "--> ERROR: server/index.js not found. Repository may be incomplete."
  exit 1
fi

echo ""
echo "==> Codespace is Copilot-ready!"
echo "    Start the dev server with:  npm run dev"
echo "    Server URL:                 http://localhost:5000"
echo "    Copilot instructions:       .github/copilot-instructions.md"
