#!/bin/bash

# One-liner deployment command for KsauniBliss
# Run this after connecting to your VPS with OTP

echo "=== KsauniBliss Quick Deployment for ksaunibliss.com ==="

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install global packages
npm install -g pm2

# Install other required packages
apt install nginx git certbot python3-certbot-nginx ufw fail2ban -y

# Setup application
cd /var/www
rm -rf ksaunibliss 2>/dev/null || true
git clone https://github.com/mayurimulay789/KsauniBlissFinal.git ksaunibliss
cd ksaunibliss

# Set permissions
chown -R www-data:www-data /var/www/ksaunibliss
chmod -R 755 /var/www/ksaunibliss

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install

# Build client
npm run build
cd ..

# Setup production environment
cd server
cp .env .env.production
sed -i 's|NODE_ENV=development|NODE_ENV=production|g' .env.production
sed -i 's|HOST=localhost|HOST=0.0.0.0|g' .env.production
sed -i 's|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://ksaunibliss.com|g' .env.production
sed -i 's|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=https://ksaunibliss.com|g' .env.production
cd ..

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | bash

# Configure Nginx
cat > /etc/nginx/sites-available/ksaunibliss << 'EOF'
server {
    listen 80;
    server_name ksaunibliss.com www.ksaunibliss.com;
    root /var/www/ksaunibliss/client/dist;
    index index.html index.htm;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/ksaunibliss /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx

# Setup firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

# Enable fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo ""
echo "=== Deployment Status ==="
echo "PM2 Status:"
pm2 status
echo ""
echo "Nginx Status:"
systemctl is-active nginx && echo "✓ Nginx is running" || echo "✗ Nginx is not running"
echo ""
echo "Application should be accessible at: http://ksaunibliss.com"
echo ""
echo "To setup SSL certificate, run:"
echo "certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com --email ksaunibliss@gmail.com --agree-tos --non-interactive"
echo ""
echo "=== Deployment Complete ==="
