#!/bin/bash

# Build client with fixed Vite config and deploy to server

# Server information
SERVER="root@31.97.227.75"
SERVER_PATH="/var/www/ksaunibliss"

# Build client
echo "Building client with updated Vite configuration..."
cd client
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Please check the errors and try again."
  exit 1
fi

echo "Build successful. Copying to server..."

# Copy the dist folder to server
scp -r dist $SERVER:$SERVER_PATH/client/

echo "Rebuilding client container on server..."

# SSH into server to rebuild the client container
ssh $SERVER << 'EOL'
cd /var/www/ksaunibliss
docker-compose build --no-cache client
docker-compose up -d client
echo "Client container rebuilt and restarted."
docker-compose ps
EOL

echo "Deployment complete!"
