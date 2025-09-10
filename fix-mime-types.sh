#!/bin/bash

# Script to fix the MIME type issue for JavaScript modules

echo "Fixing MIME type issues for JavaScript modules..."

# Update nginx configuration for the client container
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

# Update the client Dockerfile to fix permissions
cat > client/Dockerfile << 'EOL'
# Using a simple nginx container
FROM nginx:alpine

# Copy pre-built assets - we'll build locally first
COPY dist /usr/share/nginx/html
# Fix permissions on the static files
RUN chmod -R 755 /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOL

# Rebuild and restart containers
docker-compose down
docker-compose build --no-cache client
docker-compose up -d

echo "MIME type issues should now be fixed. Check the application in your browser."
