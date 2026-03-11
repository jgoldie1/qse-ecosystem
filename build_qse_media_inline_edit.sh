#!/bin/bash
# Build script for QSE Media Inline Edit feature
# Installs dependencies, validates the feature, and starts the server.
# All output is logged to qse-server.log.

set -e

LOG_FILE="qse-server.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

log() {
  echo "[QSE] $*" | tee -a "$LOG_FILE"
}

echo "" >> "$LOG_FILE"
log "============================================"
log "QSE Media Inline Edit - Build Started"
log "Timestamp: $(date)"
log "============================================"

# Install dependencies
log "Installing dependencies..."
npm install >> "$LOG_FILE" 2>&1
log "Dependencies installed."

# Validate key files exist
log "Validating Media Inline Edit files..."

REQUIRED_FILES=(
  "core/streaming-engine.js"
  "routes/streaming.js"
  "apps/sculptify-web/public/app.js"
  "apps/march-lewis-web/public/app.js"
  "apps/sculptify-web/public/index.html"
  "apps/march-lewis-web/public/index.html"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$SCRIPT_DIR/$f" ]; then
    log "  OK: $f"
  else
    log "  MISSING: $f"
    exit 1
  fi
done

# Check that inline edit route is registered
if grep -q "router.put.*content.*:id" routes/streaming.js; then
  log "  OK: PUT /api/streaming/content/:id route registered"
else
  log "  ERROR: PUT /api/streaming/content/:id route not found in routes/streaming.js"
  exit 1
fi

# Check that updateContent method exists in streaming engine
if grep -q "updateContent" core/streaming-engine.js; then
  log "  OK: updateContent method present in streaming-engine.js"
else
  log "  ERROR: updateContent method not found in core/streaming-engine.js"
  exit 1
fi

# Check that inline edit UI is present in both web apps
if grep -q "saveInlineEdit" apps/sculptify-web/public/app.js && \
   grep -q "saveInlineEdit" apps/march-lewis-web/public/app.js; then
  log "  OK: Inline edit UI present in both web apps"
else
  log "  ERROR: Inline edit UI missing from web app(s)"
  exit 1
fi

log "All validation checks passed."

# Start the QSE server and log output
log "Starting QSE Ecosystem server..."
node server.js >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > qse-server.pid
log "Server started with PID: $SERVER_PID (saved to qse-server.pid)"

# Wait briefly and confirm the server is running
sleep 2
if kill -0 "$SERVER_PID" 2>/dev/null; then
  log "Server is running on http://localhost:${PORT:-5000}"
  log "Media Inline Edit endpoints:"
  log "  GET  /api/streaming/content          - List all media"
  log "  GET  /api/streaming/content/:id      - Get a media item"
  log "  POST /api/streaming/content          - Add a media item"
  log "  PUT  /api/streaming/content/:id      - Inline-edit a media item"
  log "Web apps with Media Inline Edit:"
  log "  http://localhost:${PORT:-5000}/sculptify    - Sculptify Media Library"
  log "  http://localhost:${PORT:-5000}/march-lewis  - March & Lewis Media Library"
  log "============================================"
  log "Build complete. View logs: cat $LOG_FILE"
  log "============================================"
else
  log "ERROR: Server failed to start. Check $LOG_FILE for details."
  exit 1
fi
