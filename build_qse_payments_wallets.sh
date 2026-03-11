#!/bin/bash
# build_qse_payments_wallets.sh
# Installs dependencies and starts the QSE Ecosystem server,
# with all output written to qse-server.log.

set -euo pipefail

LOG_FILE="qse-server.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

cd "$SCRIPT_DIR"

# Start fresh log
> "$LOG_FILE"

log "=== QSE Payments & Wallets Build ==="
log "Working directory: $SCRIPT_DIR"

# Verify Node.js is available
if ! command -v node &>/dev/null; then
  log "ERROR: Node.js is not installed. Please install Node.js 18+ and retry."
  exit 1
fi
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

# Install npm dependencies
log "Installing npm dependencies..."
npm install --silent >> "$LOG_FILE" 2>&1
log "Dependencies installed successfully."

# Validate key modules load without errors
log "Validating payments engine..."
node -e "require('./core/payments-engine'); console.log('payments-engine OK');" >> "$LOG_FILE" 2>&1

log "Validating wallet engine..."
node -e "require('./core/wallet-engine'); console.log('wallet-engine OK');" >> "$LOG_FILE" 2>&1

log "Validating payments route..."
node -e "require('./routes/payments'); console.log('payments route OK');" >> "$LOG_FILE" 2>&1

log "Validating wallets route..."
node -e "require('./routes/wallets'); console.log('wallets route OK');" >> "$LOG_FILE" 2>&1

# Kill any previously running server on port 5000
if lsof -ti :5000 &>/dev/null; then
  log "Stopping existing server on port 5000..."
  kill "$(lsof -ti :5000)" 2>/dev/null || true
  sleep 1
fi

# Start the server in the background, appending all output to the log
log "Starting QSE Ecosystem server..."
node server.js >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > qse-server.pid

# Wait briefly and confirm the server is running
sleep 2
if kill -0 "$SERVER_PID" 2>/dev/null; then
  log "QSE Ecosystem server started (PID $SERVER_PID)."
  log "API endpoints available:"
  log "  GET  /api/health"
  log "  GET  /api/wallets/:userId"
  log "  POST /api/wallets/transfer"
  log "  POST /api/wallets/earn"
  log "  GET  /api/payments"
  log "  GET  /api/payments/user/:userId"
  log "  POST /api/payments/process"
  log ""
  log "View logs at any time with: cat $LOG_FILE"
  log "Stop the server with:       kill \$(cat qse-server.pid)"
else
  log "ERROR: Server failed to start. Check $LOG_FILE for details."
  exit 1
fi
