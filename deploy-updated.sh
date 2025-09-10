#!/bin/bash

# This script will deploy the updated configurations to your server

# Server address
SERVER_IP="31.97.227.75"
SERVER_USER="root"
SERVER_PATH="/var/www/ksaunibliss"

echo "Deploying updated files to server..."

# Copy updated Dockerfiles
echo "Copying updated Dockerfiles..."
scp server/Dockerfile $SERVER_USER@$SERVER_IP:$SERVER_PATH/server/
scp client/Dockerfile $SERVER_USER@$SERVER_IP:$SERVER_PATH/client/
scp client/nginx.conf $SERVER_USER@$SERVER_IP:$SERVER_PATH/client/

# Copy updated docker-compose.yml
echo "Copying updated docker-compose.yml..."
scp docker-compose.updated.yml $SERVER_USER@$SERVER_IP:$SERVER_PATH/docker-compose.yml

# SSH into server and restart containers
echo "Restarting containers on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /var/www/ksaunibliss

# Stop and remove containers
docker-compose down

# Update docker-compose.yml if needed
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - server
    environment:
      - NODE_ENV=production
    dns:
      - 8.8.8.8
      - 8.8.4.4
    networks:
      - app-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5001:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb+srv://ksaunibliss:LGaRwEasIMDN1M2x@cluster0.lbc8x6q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
      - FRONTEND_URL=https://ksaunibliss.com
    networks:
      - app-network
    restart: on-failure

networks:
  app-network:
    driver: bridge
EOL

# Rebuild containers
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Check container status
echo "Containers have been rebuilt and restarted."
docker-compose ps
EOF

echo "Deployment complete!"
