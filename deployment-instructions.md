# Deployment Instructions for KsauniBliss

## Step 1: Upload the Updated Dockerfiles

First, copy the updated Dockerfile to your server:

```bash
# From your local machine
scp server/Dockerfile root@31.97.227.75:/var/www/ksaunibliss/server/Dockerfile
```

## Step 2: Update Docker Compose Configuration

Your current docker-compose.yml has some issues that we need to fix:

1. The server container doesn't have proper permissions to create the node_modules directory
2. The client container has permission issues with static assets
3. There might be port conflicts with existing services

Create or edit your docker-compose.yml on the server with the following updates:

```yaml
version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "8080:80"  # Changed from 80:80 to avoid conflicts
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
      - "5001:5000"  # Changed from 5000:5000 to avoid conflicts
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb+srv://ksaunibliss:LGaRwEasIMDN1M2x@cluster0.lbc8x6q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
      - FRONTEND_URL=https://ksaunibliss.com
    volumes:
      - ./server:/app
      - server_node_modules:/app/node_modules  # Named volume for node_modules
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  server_node_modules:  # Define the named volume
```

## Step 3: Update Nginx Configuration for the Client Container

Since we saw permission issues with static assets, make sure your nginx.conf in the client directory has proper permissions:

```bash
# On your server
chmod 644 /var/www/ksaunibliss/client/nginx.conf
```

## Step 4: Update Host Nginx Configuration

Create or update your Nginx configuration on the host to proxy requests to your Docker containers:

```
server {
    listen 80;
    listen [::]:80;
    server_name ksaunibliss.com www.ksaunibliss.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ksaunibliss.com www.ksaunibliss.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/ksaunibliss.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ksaunibliss.com/privkey.pem;
    
    # Frontend client
    location / {
        proxy_pass http://localhost:8080;  # Point to the client container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;  # Point to the server container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save this to `/etc/nginx/sites-available/ksaunibliss.com` and create a symlink:

```bash
ln -s /etc/nginx/sites-available/ksaunibliss.com /etc/nginx/sites-enabled/
nginx -t  # Test the configuration
systemctl reload nginx  # Reload Nginx
```

## Step 5: Build and Start the Containers

```bash
cd /var/www/ksaunibliss
docker-compose down  # Stop any running containers
docker-compose build --no-cache  # Force rebuild
docker-compose up -d  # Start in detached mode
```

## Step 6: Monitor and Troubleshoot

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f client
docker-compose logs -f server

# Check for specific errors in the server container
docker-compose logs server | grep -i error
```

## Step 7: Test the Application

Test that both the frontend and backend are working:

```bash
# Test frontend
curl -I https://ksaunibliss.com

# Test backend API
curl -I https://ksaunibliss.com/api/health  # Assuming you have a health endpoint
```

Visit https://ksaunibliss.com in your browser to ensure everything is working properly.
