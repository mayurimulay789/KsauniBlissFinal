#!/bin/bash

# Pull latest changes
git pull origin main

# Build and start containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Setup Nginx and SSL
if [ ! -f "/etc/nginx/sites-available/ksaunibliss" ]; then
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/ksaunibliss > /dev/null <<EOT
server {
    listen 80;
    server_name ksaunibliss.com www.ksaunibliss.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/ksaunibliss /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default

    # Install SSL certificate
    sudo certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com --email ksaunibliss@gmail.com --agree-tos --non-interactive
fi

# Restart Nginx
sudo systemctl restart nginx

echo "Deployment completed successfully!"
