#!/bin/bash

# Hostinger VPS Deployment Script for KsauniBliss
# This script automates the deployment process on your VPS

set -e  # Exit on any error

# Configuration
APP_NAME="ksaunibliss"
APP_DIR="/home/u574849695/$APP_NAME"
REPO_URL="https://github.com/mayurimulay789/KsauniBlissFinal.git"
BRANCH="main"

echo "🚀 Starting deployment of $APP_NAME..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again to use Docker without sudo."
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo "🔄 Updating existing repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    echo "📥 Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Remove old images to free space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health checks..."

# Check if containers are running
if docker ps | grep -q "$APP_NAME"; then
    echo "✅ Containers are running"
else
    echo "❌ Containers failed to start"
    docker-compose logs
    exit 1
fi

# Check server health
if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ Server is responding"
else
    echo "⚠️  Server health check failed, but container is running"
fi

# Check client health
if curl -f http://localhost:80 >/dev/null 2>&1; then
    echo "✅ Client is responding"
else
    echo "⚠️  Client health check failed, but container is running"
fi

# Show running containers
echo "📊 Current container status:"
docker ps

# Show logs
echo "📝 Recent logs:"
docker-compose logs --tail=20

# Cleanup
echo "🧹 Final cleanup..."
docker system prune -f

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application should be available at:"
echo "   - Frontend: http://your-domain.com"
echo "   - Backend API: http://your-domain.com/api"
echo "   - Direct Backend: http://your-domain.com:5000"

# Optional: Setup SSL certificates
echo ""
echo "🔒 To setup SSL certificates, run:"
echo "   sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
