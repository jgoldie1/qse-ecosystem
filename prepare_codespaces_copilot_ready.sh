#!/usr/bin/env bash
# prepare_codespaces_copilot_ready.sh
# Idempotent setup script for QSE Ecosystem Codespaces + Copilot environment.
# Safe to re-run: existing files are backed up before being updated.
# Usage: bash prepare_codespaces_copilot_ready.sh [--force]
set -Eeuo pipefail

# ---------------------------------------------------------------------------
# Resolve repo root (works from any directory)
# ---------------------------------------------------------------------------
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  ROOT="$(git rev-parse --show-toplevel)"
else
  ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
fi
cd "$ROOT"

FORCE="${1:-}"
TS="$(date +%Y%m%d_%H%M%S)"

log()  { printf '\033[0;32m[prepare]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[prepare WARN]\033[0m %s\n' "$*" >&2; }

# ---------------------------------------------------------------------------
# Helper: write a file, backing up any existing content first
# If --force is NOT given, skip files that already exist.
# ---------------------------------------------------------------------------
write_file() {
  local dst="$1"
  local content="$2"
  local dir
  dir="$(dirname "$dst")"
  mkdir -p "$dir"

  if [ -f "$dst" ]; then
    if [ "$FORCE" = "--force" ]; then
      local bak="${dst}.bak.${TS}"
      cp "$dst" "$bak"
      warn "Backed up existing file: $dst → $bak"
    else
      warn "Skipping (already exists): $dst  (re-run with --force to overwrite)"
      return 0
    fi
  fi

  printf '%s\n' "$content" > "$dst"
  log "Written: $dst"
}

# ---------------------------------------------------------------------------
# Ensure required directories exist
# ---------------------------------------------------------------------------
log "Ensuring directory structure ..."
mkdir -p \
  "$ROOT/.devcontainer" \
  "$ROOT/.github" \
  "$ROOT/.vscode" \
  "$ROOT/scripts" \
  "$ROOT/server" \
  "$ROOT/server/data" \
  "$ROOT/server/middleware" \
  "$ROOT/server/routes" \
  "$ROOT/server/services" \
  "$ROOT/public" \
  "$ROOT/apps/sculptify-web/public/assets/css" \
  "$ROOT/apps/sculptify-web/public/assets/js" \
  "$ROOT/apps/march-lewis-web/public/assets/css" \
  "$ROOT/apps/march-lewis-web/public/assets/js" \
  "$ROOT/data" \
  "$ROOT/uploads/therapists" \
  "$ROOT/uploads/candidates" \
  "$ROOT/uploads/employers"

# ---------------------------------------------------------------------------
# .devcontainer/devcontainer.json
# ---------------------------------------------------------------------------
write_file "$ROOT/.devcontainer/devcontainer.json" '{
  "name": "QSE Codespace",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  "forwardPorts": [5000],
  "portsAttributes": {
    "5000": {
      "label": "QSE App",
      "onAutoForward": "openBrowser"
    }
  },
  "customizations": {
    "vscode": {
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash",
        "editor.formatOnSave": true,
        "files.eol": "\n",
        "github.copilot.enable": {
          "*": true,
          "plaintext": true,
          "markdown": true,
          "scminput": false
        }
      },
      "extensions": [
        "GitHub.copilot",
        "GitHub.copilot-chat",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker"
      ]
    }
  },
  "postCreateCommand": "bash scripts/post-create.sh",
  "postStartCommand": "bash scripts/post-start.sh",
  "remoteUser": "node"
}'

# ---------------------------------------------------------------------------
# .devcontainer/Dockerfile
# ---------------------------------------------------------------------------
write_file "$ROOT/.devcontainer/Dockerfile" 'FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends sqlite3 openssl ca-certificates \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*'

# ---------------------------------------------------------------------------
# .github/copilot-instructions.md
# ---------------------------------------------------------------------------
write_file "$ROOT/.github/copilot-instructions.md" '# QSE Ecosystem — Copilot Instructions

## About this repository
This is the QSE Ecosystem monorepo. It contains:
- `server/index.js` — Express server entry point, runs on port **5000**
- `server/routes/` — API route handlers (auth, sculptify, march-lewis)
- `server/services/` — Business logic (authService, sculptifyService, marchLewisService)
- `server/middleware/` — Auth (JWT) and validation middleware
- `apps/sculptify-web/` — Sculptify Ltd static web app
- `apps/march-lewis-web/` — March & Lewis static web app

## Key URLs (when running)
- `http://localhost:5000` — landing/home
- `http://localhost:5000/api/health` — health check (returns `{"ok":true}`)
- `http://localhost:5000/sculptify` — Sculptify web app
- `http://localhost:5000/march-lewis` — March & Lewis web app

## How to run
```bash
npm install
npm run dev
```

## Coding conventions
- Use `require`/`module.exports` (CommonJS)
- Always return `{ ok: true, ... }` on success and `{ ok: false, message: '"'"'...'"'"' }` on errors
- Do not remove or rename existing routes; only extend them
- Use `process.env.PORT || 5000` for the server port'

# ---------------------------------------------------------------------------
# .vscode/settings.json
# ---------------------------------------------------------------------------
write_file "$ROOT/.vscode/settings.json" '{
  "terminal.integrated.defaultProfile.linux": "bash",
  "editor.formatOnSave": true,
  "files.eol": "\n",
  "editor.tabSize": 2,
  "github.copilot.enable": {
    "*": true,
    "plaintext": true,
    "markdown": true,
    "scminput": false
  }
}'

# ---------------------------------------------------------------------------
# .vscode/extensions.json
# ---------------------------------------------------------------------------
write_file "$ROOT/.vscode/extensions.json" '{
  "recommendations": [
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker"
  ]
}'

# ---------------------------------------------------------------------------
# scripts/post-create.sh
# ---------------------------------------------------------------------------
write_file "$ROOT/scripts/post-create.sh" '#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd -- "$(git -C "$(dirname -- "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null || dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$REPO_ROOT"

echo "[post-create] Installing Node dependencies in $REPO_ROOT ..."
if [ -f package.json ]; then
  npm install
else
  echo "[post-create] No package.json found, skipping npm install."
fi
echo "[post-create] Done. Run: npm run dev"'
chmod +x "$ROOT/scripts/post-create.sh"

# ---------------------------------------------------------------------------
# scripts/post-start.sh
# ---------------------------------------------------------------------------
write_file "$ROOT/scripts/post-start.sh" '#!/usr/bin/env bash
set -Eeuo pipefail

echo "[post-start] Codespace is ready."
echo "[post-start] Start the server:  npm run dev"
echo "[post-start] App URL:            http://localhost:5000"
echo "[post-start] Health check:       http://localhost:5000/api/health"'
chmod +x "$ROOT/scripts/post-start.sh"

# ---------------------------------------------------------------------------
# scripts/dev-reset.sh
# ---------------------------------------------------------------------------
write_file "$ROOT/scripts/dev-reset.sh" '#!/usr/bin/env bash
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
npm run dev'
chmod +x "$ROOT/scripts/dev-reset.sh"

# ---------------------------------------------------------------------------
# server/index.js (only if missing)
# ---------------------------------------------------------------------------
if [ ! -f "$ROOT/server/index.js" ]; then
  log "Creating minimal server/index.js ..."
  cat > "$ROOT/server/index.js" << 'JS'
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static public apps
app.use('/sculptify', express.static(path.resolve(__dirname, '..', 'apps', 'sculptify-web', 'public')));
app.use('/march-lewis', express.static(path.resolve(__dirname, '..', 'apps', 'march-lewis-web', 'public')));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Landing
app.get('/', (_req, res) => res.json({ ok: true, app: 'QSE Ecosystem', port: PORT }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
JS
fi

# ---------------------------------------------------------------------------
# package.json — ensure required dependencies are declared
# ---------------------------------------------------------------------------
log "Checking package.json dependencies ..."
if [ -f "$ROOT/package.json" ]; then
  node - <<'NODE'
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const required = {
  dependencies: {
    express: '^4.19.2',
    bcryptjs: '^3.0.3',
    jsonwebtoken: '^9.0.3',
    multer: '^2.1.1',
    sqlite3: '^5.1.7'
  },
  devDependencies: {
    nodemon: '^3.0.1'
  },
  scripts: {
    start: 'node server/index.js',
    dev: 'nodemon server/index.js'
  }
};

let changed = false;

for (const [section, entries] of Object.entries(required)) {
  if (!pkg[section]) { pkg[section] = {}; }
  for (const [key, val] of Object.entries(entries)) {
    if (!pkg[section][key]) {
      pkg[section][key] = val;
      console.log(`Added ${section}.${key} = ${val}`);
      changed = true;
    }
  }
}

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('package.json updated.');
} else {
  console.log('package.json already up to date.');
}
NODE
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
log ""
log "Setup complete! Next steps:"
log "  1. Rebuild the Codespace (or run: npm install)"
log "  2. npm run dev"
log "  3. Open http://localhost:5000"
log "  4. Health check: http://localhost:5000/api/health"
log ""
log "To force-overwrite existing files next time, run:"
log "  bash prepare_codespaces_copilot_ready.sh --force"
