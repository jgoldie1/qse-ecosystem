#!/bin/bash
# build_qse_part6.sh - QSE Ecosystem Part 6 Build & Validation Script
# Starts the server, runs health checks on all API endpoints, logs to qse-server.log

LOG_FILE="qse-server.log"
PORT=5000
SERVER_PID=""

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    log "Stopping QSE server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    log "Server stopped."
  fi
}

trap cleanup EXIT

# Reset log file
> "$LOG_FILE"

log "============================================"
log " QSE Ecosystem - Part 6 Build Script"
log "============================================"

# Step 1: Install dependencies
log "Installing npm dependencies..."
npm install >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  log "ERROR: npm install failed. Aborting."
  exit 1
fi
log "Dependencies installed successfully."

# Step 2: Validate required files exist
log "Validating project structure..."
REQUIRED_FILES=(
  "server.js"
  "routes/health.js"
  "routes/ai.js"
  "routes/tasks.js"
  "routes/training.js"
  "routes/wallets.js"
  "routes/streaming.js"
  "routes/rewards.js"
  "routes/memberships.js"
  "core/ai-coach.js"
  "core/marketplace-engine.js"
  "core/membership-engine.js"
  "core/qse-core.js"
  "core/rewards-engine.js"
  "core/seo-engine.js"
  "core/streaming-engine.js"
  "core/task-engine.js"
  "core/training-engine.js"
  "core/wallet-engine.js"
  "apps/sculptify-web/public/index.html"
  "apps/march-lewis-web/public/index.html"
)

ALL_OK=true
for FILE in "${REQUIRED_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    log "  [OK] $FILE"
  else
    log "  [MISSING] $FILE"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = false ]; then
  log "ERROR: One or more required files are missing. Aborting."
  exit 1
fi
log "Project structure validated."

# Step 3: Start the server in background
log "Starting QSE Ecosystem server on port $PORT..."
node server.js >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
log "Server started with PID $SERVER_PID."

# Wait for server to become ready
RETRIES=10
READY=false
for i in $(seq 1 $RETRIES); do
  sleep 1
  if curl -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
    READY=true
    break
  fi
  log "  Waiting for server to be ready... ($i/$RETRIES)"
done

if [ "$READY" = false ]; then
  log "ERROR: Server did not start within expected time."
  exit 1
fi
log "Server is ready."

# Step 4: Run API health checks
log "--------------------------------------------"
log " Running API endpoint checks..."
log "--------------------------------------------"

check_endpoint() {
  local METHOD="$1"
  local ENDPOINT="$2"
  local DATA="$3"
  local DESC="$4"
  local HTTP_CODE

  if [ "$METHOD" = "GET" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$ENDPOINT")
  else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d "$DATA" \
      "http://localhost:$PORT$ENDPOINT")
  fi

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
    log "  [PASS] $DESC ($METHOD $ENDPOINT) => HTTP $HTTP_CODE"
  else
    log "  [FAIL] $DESC ($METHOD $ENDPOINT) => HTTP $HTTP_CODE"
  fi
}

# Health
check_endpoint GET /api/health "" "Health check"

# AI Coach
check_endpoint POST /api/ai/coach \
  '{"userId":"user1","message":"I need motivation","context":"sculptify"}' \
  "AI coach response"
check_endpoint GET /api/ai/coach/tips "" "AI motivational tips"

# Tasks
check_endpoint GET /api/tasks "" "List tasks"
check_endpoint POST /api/tasks \
  '{"title":"Test Task","description":"Part 6 build test","app":"sculptify"}' \
  "Create task"

# Training
check_endpoint GET /api/training/courses "" "List training courses"
check_endpoint POST /api/training/enroll \
  '{"userId":"user1","courseId":"c1"}' \
  "Enroll in course"
check_endpoint GET /api/training/progress/user1 "" "Get training progress"

# Wallets
check_endpoint GET /api/wallets/user1 "" "Get wallet"
check_endpoint POST /api/wallets/earn \
  '{"userId":"user1","amount":50,"reason":"Part 6 build bonus"}' \
  "Earn tokens"
check_endpoint POST /api/wallets/transfer \
  '{"fromUserId":"user1","toUserId":"user2","amount":10,"currency":"ASH"}' \
  "Transfer tokens"

# Streaming
check_endpoint GET /api/streaming/content "" "List streaming content"
check_endpoint POST /api/streaming/content \
  '{"title":"QSE Build Tutorial","type":"video","app":"sculptify"}' \
  "Add streaming content"

# Rewards
check_endpoint GET /api/rewards "" "List rewards"
check_endpoint POST /api/rewards/issue \
  '{"userId":"user1","type":"milestone"}' \
  "Issue reward"
check_endpoint GET /api/rewards/user/user1 "" "Get user rewards"

# Memberships
check_endpoint GET /api/memberships/tiers "" "List membership tiers"
check_endpoint POST /api/memberships/subscribe \
  '{"userId":"user1","tier":"pro"}' \
  "Subscribe to membership"
check_endpoint GET /api/memberships/user/user1 "" "Get user membership"

# Web apps
check_endpoint GET /sculptify "" "Sculptify web app"
check_endpoint GET /march-lewis "" "March & Lewis web app"
check_endpoint GET / "" "Root landing page"

log "--------------------------------------------"
log " All endpoint checks complete."
log "--------------------------------------------"
log "QSE Ecosystem Part 6 build completed successfully."
log "Server log: $LOG_FILE"
