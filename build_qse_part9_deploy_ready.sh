#!/usr/bin/env bash
# build_qse_part9_deploy_ready.sh
# Makes the QSE Ecosystem production deploy-ready.
# Idempotent — safe to run multiple times.
set -Eeuo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"

# ---------------------------------------------------------------------------
# 1. Fix package.json — add missing runtime dependencies and metadata
# ---------------------------------------------------------------------------
echo "==> Updating package.json..."

node - <<'NODEJS'
const fs = require('fs');
const path = require('path');
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Ensure required runtime dependencies are listed
const required = {
  bcryptjs: '^2.4.3',
  cors: '^2.8.5',
  jsonwebtoken: '^9.0.2'
};
pkg.dependencies = pkg.dependencies || {};
let changed = false;
for (const [name, ver] of Object.entries(required)) {
  if (!pkg.dependencies[name]) {
    pkg.dependencies[name] = ver;
    changed = true;
    console.log(`  + Added dependency: ${name}@${ver}`);
  }
}

// Add engines field if missing
if (!pkg.engines) {
  pkg.engines = { node: '>=18.0.0' };
  changed = true;
  console.log('  + Added engines: { node: ">=18.0.0" }');
}

// Add scripts.start:prod if missing
pkg.scripts = pkg.scripts || {};
if (!pkg.scripts['start:prod']) {
  pkg.scripts['start:prod'] = 'NODE_ENV=production node server/index.js';
  changed = true;
  console.log('  + Added scripts.start:prod');
}

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  package.json updated.');
} else {
  console.log('  package.json already up to date.');
}
NODEJS

# ---------------------------------------------------------------------------
# 2. Update .env.example — ensure all required vars are documented
# ---------------------------------------------------------------------------
echo "==> Updating .env.example..."

ENV_EXAMPLE="$ROOT/.env.example"
declare -A ENV_VARS=(
  [PORT]="5000"
  [NODE_ENV]="production"
  [JWT_SECRET]="replace-with-a-long-random-secret"
  [SESSION_SECRET]="change-me-in-production"
)

for key in PORT NODE_ENV JWT_SECRET SESSION_SECRET; do
  val="${ENV_VARS[$key]}"
  if ! grep -q "^${key}=" "$ENV_EXAMPLE" 2>/dev/null; then
    echo "${key}=${val}" >> "$ENV_EXAMPLE"
    echo "  + Added ${key} to .env.example"
  fi
done

# ---------------------------------------------------------------------------
# 3. Add CORS middleware to server/index.js if not already configured
# ---------------------------------------------------------------------------
echo "==> Checking CORS configuration in server/index.js..."

INDEX="$SERVER/index.js"
if ! grep -q "require('cors')\|require(\"cors\")" "$INDEX"; then
  # Prepend cors require at the very top of the file, then insert middleware use
  # before the first app.use(...) line — this is robust regardless of file structure.
  {
    echo "const cors = require('cors');"
    cat "$INDEX"
  } > "$INDEX.tmp"
  awk '
    /^app\.use\(express\.json/ {
      print "app.use(cors({ origin: process.env.CORS_ORIGIN || false, credentials: true }));";
      print $0;
      next
    }
    { print }
  ' "$INDEX.tmp" > "$INDEX" && rm -f "$INDEX.tmp"
  echo "  + CORS middleware added to server/index.js"
else
  echo "  CORS already configured in server/index.js"
fi

# also add CORS_ORIGIN to .env.example if missing
if ! grep -q "^CORS_ORIGIN=" "$ENV_EXAMPLE" 2>/dev/null; then
  echo "CORS_ORIGIN=" >> "$ENV_EXAMPLE"
  echo "  + Added CORS_ORIGIN to .env.example"
fi

# ---------------------------------------------------------------------------
# 4. Create Procfile for Heroku / Railway deployment
# ---------------------------------------------------------------------------
echo "==> Creating Procfile..."

PROCFILE="$ROOT/Procfile"
if [ ! -f "$PROCFILE" ]; then
  cat > "$PROCFILE" <<'PROCFILE'
web: node server/index.js
PROCFILE
  echo "  + Procfile created"
else
  echo "  Procfile already exists"
fi

# ---------------------------------------------------------------------------
# 5. Create Dockerfile for containerised deployments
# ---------------------------------------------------------------------------
echo "==> Creating Dockerfile..."

DOCKERFILE="$ROOT/Dockerfile"
if [ ! -f "$DOCKERFILE" ]; then
  cat > "$DOCKERFILE" <<'DOCKERFILE'
# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Ensure the data directory exists for SQLite
RUN mkdir -p server/data server/uploads

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
DOCKERFILE
  echo "  + Dockerfile created"
else
  echo "  Dockerfile already exists"
fi

# ---------------------------------------------------------------------------
# 6. Create .dockerignore
# ---------------------------------------------------------------------------
echo "==> Creating .dockerignore..."

DOCKERIGNORE="$ROOT/.dockerignore"
if [ ! -f "$DOCKERIGNORE" ]; then
  cat > "$DOCKERIGNORE" <<'DOCKERIGNORE'
node_modules
npm-debug.log*
.env
.env.local
.git
.github
.devcontainer
*.md
server/data/*.db
server/uploads/*
!server/uploads/.gitkeep
DOCKERIGNORE
  echo "  + .dockerignore created"
else
  echo "  .dockerignore already exists"
fi

# ---------------------------------------------------------------------------
# 7. Add .gitkeep files so uploads and data dirs are tracked without content
# ---------------------------------------------------------------------------
echo "==> Ensuring placeholder files for data/uploads directories..."
mkdir -p "$SERVER/data" "$SERVER/uploads"
touch "$SERVER/data/.gitkeep"
touch "$SERVER/uploads/.gitkeep"

# Ensure these are listed in .gitignore properly
GITIGNORE="$ROOT/.gitignore"
for line in "server/data/*.db" "server/uploads/*" "!server/data/.gitkeep" "!server/uploads/.gitkeep"; do
  if ! grep -qF "$line" "$GITIGNORE" 2>/dev/null; then
    echo "$line" >> "$GITIGNORE"
    echo "  + Added '$line' to .gitignore"
  fi
done

# ---------------------------------------------------------------------------
# 8. Install all dependencies (including newly added ones)
# ---------------------------------------------------------------------------
echo "==> Installing dependencies..."
npm install

echo ""
echo "=========================================="
echo " Part 9 deploy-ready build complete!"
echo "=========================================="
echo ""
echo " Deployment options:"
echo "   Heroku / Railway  -> git push <remote> main"
echo "   Docker            -> docker build -t qse-ecosystem . && docker run -p 5000:5000 qse-ecosystem"
echo "   Local production  -> npm run start:prod"
echo ""
