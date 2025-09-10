## Quick Deployment Commands

Execute these commands directly in your SSH session:

```bash
# 1. Go to the project directory
cd /var/www/ksaunibliss

# 2. Stop the current containers
docker-compose down

# 3. Update the docker-compose.yml file
cat > docker-compose.yml << 'EOL'
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
EOL

# 4. Update the server Dockerfile
cat > server/Dockerfile << 'EOL'
FROM node:20-alpine

WORKDIR /app

# Create a node_modules directory with proper permissions
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Switch to the node user for better security
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY --chown=node:node . .

EXPOSE 5000

CMD ["npm", "start"]
EOL

# 5. Update the Nginx host configuration
cat > /etc/nginx/sites-available/ksaunibliss.com << 'EOL'
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
EOL

# Create symlink if it doesn't exist
ln -sf /etc/nginx/sites-available/ksaunibliss.com /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# 6. Build and start the containers
docker-compose build --no-cache
docker-compose up -d

# 7. Check container status
docker-compose ps

# 8. Check logs
docker-compose logs -f
```

After these steps are completed, you should be able to access your application at https://ksaunibliss.com.
