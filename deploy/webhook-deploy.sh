#!/bin/bash

# Webhook Deployment Handler for KsauniBliss
# This script is triggered by GitHub webhooks for instant deployment

set -e

# Configuration
APP_NAME="ksaunibliss"
APP_DIR="/home/u574849695/$APP_NAME"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"
LOCK_FILE="/tmp/${APP_NAME}-deploy.lock"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to cleanup on exit
cleanup() {
    rm -f "$LOCK_FILE"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Check if deployment is already running
if [ -f "$LOCK_FILE" ]; then
    log "⚠️  Deployment already in progress. Exiting."
    exit 1
fi

# Create lock file
touch "$LOCK_FILE"

log "🚀 Starting automated deployment..."

# Change to app directory
cd "$APP_DIR" || {
    log "❌ Failed to change to app directory: $APP_DIR"
    exit 1
}

# Pull latest changes
log "📥 Pulling latest changes from Git..."
if ! git pull origin main; then
    log "❌ Failed to pull changes from Git"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "docker-compose.yml" ]; then
    log "❌ docker-compose.yml not found"
    exit 1
fi

# Stop existing containers
log "🛑 Stopping existing containers..."
docker-compose down || true

# Remove unused images to free space
log "🧹 Cleaning up unused Docker images..."
docker image prune -f || true

# Build and start containers
log "🔨 Building and starting containers..."
if ! docker-compose up --build -d; then
    log "❌ Failed to start containers"
    # Show logs for debugging
    docker-compose logs --tail=50
    exit 1
fi

# Wait for services to initialize
log "⏳ Waiting for services to initialize..."
sleep 30

# Health checks
log "🏥 Performing health checks..."

# Check if containers are running
if ! docker ps | grep -q "$APP_NAME"; then
    log "❌ Containers are not running"
    docker-compose logs --tail=50
    exit 1
fi

# Check server health
MAX_RETRIES=10
RETRY_COUNT=0
SERVER_HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:5000/api/health > /dev/null; then
        SERVER_HEALTHY=true
        break
    fi
    log "⏳ Server not ready yet, retrying in 5 seconds... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$SERVER_HEALTHY" = true ]; then
    log "✅ Server is healthy"
else
    log "❌ Server health check failed after $MAX_RETRIES attempts"
    docker-compose logs server --tail=20
fi

# Check client health
CLIENT_HEALTHY=false
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:80 > /dev/null; then
        CLIENT_HEALTHY=true
        break
    fi
    log "⏳ Client not ready yet, retrying in 5 seconds... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$CLIENT_HEALTHY" = true ]; then
    log "✅ Client is healthy"
else
    log "❌ Client health check failed after $MAX_RETRIES attempts"
    docker-compose logs client --tail=20
fi

# Final cleanup
log "🧹 Final cleanup..."
docker system prune -f

# Show final status
log "📊 Final deployment status:"
docker ps

if [ "$SERVER_HEALTHY" = true ] && [ "$CLIENT_HEALTHY" = true ]; then
    log "🎉 Deployment completed successfully!"
    
    # Send notification (optional - you can configure this)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"✅ KsauniBliss deployment successful!"}' \
    #     YOUR_SLACK_WEBHOOK_URL
    
    exit 0
else
    log "⚠️  Deployment completed with some issues. Check the logs above."
    exit 1
fi
