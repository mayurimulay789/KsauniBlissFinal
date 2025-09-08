#!/bin/bash
echo "🚀 Starting KsauniBliss Deployment..."

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install other tools
echo "📦 Installing Nginx and tools..."
apt install nginx git certbot python3-certbot-nginx ufw -y

# Setup application
echo "🔧 Setting up application..."
cd /var/www
rm -rf ksaunibliss html/* 2>/dev/null || true
git clone https://github.com/mayurimulay789/KsauniBlissFinal.git ksaunibliss
cd ksaunibliss

# Set permissions
chown -R www-data:www-data /var/www/ksaunibliss
chmod -R 755 /var/www/ksaunibliss

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install
cd ../client && npm install

# Build client
echo "🏗️ Building client..."
npm run build
cd ..

# Setup environment
echo "⚙️ Setting up environment..."
mkdir -p logs
cd server
cp .env .env.production
sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env.production
sed -i 's/HOST=localhost/HOST=0.0.0.0/g' .env.production
sed -i 's|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://ksaunibliss.com|g' .env.production
sed -i 's|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=https://ksaunibliss.com|g' .env.production
cd ..

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/ksaunibliss << 'EOF'
server {
    listen 80;
    server_name ksaunibliss.com www.ksaunibliss.com;
    root /var/www/ksaunibliss/client/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/javascript;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/ksaunibliss /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx

# Setup firewall
echo "🔒 Setting up firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

# Check status
echo "✅ Checking deployment status..."
echo "PM2 Status:"
pm2 status
echo ""
echo "Nginx Status:"
systemctl is-active nginx && echo "✅ Nginx is running" || echo "❌ Nginx failed"
echo ""
echo "Testing backend:"
curl -s http://localhost:5000 && echo "✅ Backend is responding" || echo "❌ Backend not responding"

echo ""
echo "🎉 Deployment Complete!"
echo "Your site should be accessible at: http://ksaunibliss.com"
echo ""
echo "To setup SSL certificate, run:"
echo "certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com --email ksaunibliss@gmail.com --agree-tos --non-interactive"
