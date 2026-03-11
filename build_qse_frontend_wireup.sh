#!/usr/bin/env bash
# build_qse_frontend_wireup.sh
# Wires up the QSE Ecosystem frontend to the backend server,
# installs dependencies, and starts the server with logging.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/qse-server.log"
PORT="${PORT:-5000}"

log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "${LOG_FILE}"
}

# Truncate log from previous runs
> "${LOG_FILE}"

log "=== QSE Ecosystem Frontend Wireup ==="
log "Working directory: ${SCRIPT_DIR}"

# ── 1. Check Node.js / npm ─────────────────────────────────────────────────
log "Checking runtime dependencies..."
if ! command -v node >/dev/null 2>&1; then
  log "ERROR: node is not installed. Please install Node.js >= 16."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  log "ERROR: npm is not installed. Please install npm."
  exit 1
fi
log "  node $(node --version)"
log "  npm  $(npm --version)"

# ── 2. Install npm packages ────────────────────────────────────────────────
log "Installing npm dependencies..."
cd "${SCRIPT_DIR}"
npm install --prefer-offline 2>&1 | tee -a "${LOG_FILE}"
log "Dependencies installed."

# ── 3. Validate frontend static assets ────────────────────────────────────
log "Validating frontend static assets..."

SCULPTIFY_PUBLIC="${SCRIPT_DIR}/apps/sculptify-web/public"
MARCH_LEWIS_PUBLIC="${SCRIPT_DIR}/apps/march-lewis-web/public"

for asset in \
  "${SCULPTIFY_PUBLIC}/index.html" \
  "${SCULPTIFY_PUBLIC}/app.js" \
  "${SCULPTIFY_PUBLIC}/styles.css" \
  "${MARCH_LEWIS_PUBLIC}/index.html" \
  "${MARCH_LEWIS_PUBLIC}/app.js" \
  "${MARCH_LEWIS_PUBLIC}/styles.css"
do
  if [ -f "${asset}" ]; then
    log "  [OK]  ${asset#"${SCRIPT_DIR}/"}"
  else
    log "  [MISSING] ${asset#"${SCRIPT_DIR}/"}"
  fi
done

# ── 4. Validate core modules ───────────────────────────────────────────────
log "Validating core modules..."
for module in \
  "${SCRIPT_DIR}/core/ai-coach.js" \
  "${SCRIPT_DIR}/core/training-engine.js" \
  "${SCRIPT_DIR}/core/task-engine.js" \
  "${SCRIPT_DIR}/core/wallet-engine.js" \
  "${SCRIPT_DIR}/core/rewards-engine.js" \
  "${SCRIPT_DIR}/core/membership-engine.js" \
  "${SCRIPT_DIR}/core/streaming-engine.js" \
  "${SCRIPT_DIR}/core/marketplace-engine.js" \
  "${SCRIPT_DIR}/core/seo-engine.js"
do
  if [ -f "${module}" ]; then
    log "  [OK]  ${module#"${SCRIPT_DIR}/"}"
  else
    log "  [MISSING] ${module#"${SCRIPT_DIR}/"}"
  fi
done

# ── 5. Validate server entry point ────────────────────────────────────────
log "Validating server entry point..."
if [ -f "${SCRIPT_DIR}/server.js" ]; then
  log "  [OK]  server.js"
else
  log "  [MISSING] server.js — cannot start server."
  exit 1
fi

# ── 6. Validate API routes ─────────────────────────────────────────────────
log "Validating API routes..."
for route in \
  "${SCRIPT_DIR}/routes/health.js" \
  "${SCRIPT_DIR}/routes/ai.js" \
  "${SCRIPT_DIR}/routes/tasks.js" \
  "${SCRIPT_DIR}/routes/training.js" \
  "${SCRIPT_DIR}/routes/wallets.js" \
  "${SCRIPT_DIR}/routes/streaming.js" \
  "${SCRIPT_DIR}/routes/rewards.js" \
  "${SCRIPT_DIR}/routes/memberships.js"
do
  if [ -f "${route}" ]; then
    log "  [OK]  ${route#"${SCRIPT_DIR}/"}"
  else
    log "  [MISSING] ${route#"${SCRIPT_DIR}/"}"
  fi
done

# ── 7. Start server ────────────────────────────────────────────────────────
log "Starting QSE Ecosystem server on port ${PORT}..."

# Kill any previous instance on the same port
if command -v lsof >/dev/null 2>&1; then
  OLD_PID="$(lsof -ti tcp:"${PORT}" 2>/dev/null || true)"
  if [ -n "${OLD_PID}" ]; then
    log "Stopping existing process on port ${PORT} (PID ${OLD_PID})..."
    kill "${OLD_PID}" 2>/dev/null || true
    sleep 1
  fi
fi

export PORT
nohup node "${SCRIPT_DIR}/server.js" >> "${LOG_FILE}" 2>&1 &
SERVER_PID=$!

log "Server process started (PID ${SERVER_PID})."

# Wait briefly for server to come up
RETRIES=20
until curl -sf --max-time 2 "http://localhost:${PORT}/api/health" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "${RETRIES}" -le 0 ]; then
    log "ERROR: Server did not become healthy within the expected time."
    exit 1
  fi
  sleep 1
done

log "Health check passed."
log ""
log "=== QSE Ecosystem is running ==="
log "  Main dashboard : http://localhost:${PORT}/"
log "  Sculptify      : http://localhost:${PORT}/sculptify"
log "  March & Lewis  : http://localhost:${PORT}/march-lewis"
log "  API health     : http://localhost:${PORT}/api/health"
log "  Server PID     : ${SERVER_PID}"
log "  Log file       : ${LOG_FILE}"
log "==============================="
