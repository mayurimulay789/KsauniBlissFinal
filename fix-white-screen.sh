#!/bin/bash

# Fix white screen issue in KsauniBliss application

echo "Fixing white screen issue..."

# Step 1: Update the Nginx configuration for client container
cat > client/nginx.conf << 'EOL'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https:; font-src 'self' data: https:;" always;

    # Proper MIME types for JavaScript modules
    location ~* \.js$ {
        types { application/javascript js; }
        add_header Content-Type application/javascript;
        add_header Access-Control-Allow-Origin "*";
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
        access_log off;
    }
    
    # Cache CSS and other static assets
    location ~* \.(css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
        access_log off;
    }
    
    # Special handling for fonts
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        add_header Access-Control-Allow-Origin "*";
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
        access_log off;
    }

    location /api {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOL

# Step 2: Rebuild only the client container
docker-compose build --no-cache client
docker-compose up -d client

echo "Client container has been rebuilt. Please check if the white screen issue is resolved."
echo "If the issue persists, we may need to rebuild the client from source with modified Vite config."

# Step 3: Check for any errors in the client container logs
sleep 5
echo "Checking client container logs for errors:"
docker-compose logs --tail=20 client

echo "Completed white screen fix attempt."
