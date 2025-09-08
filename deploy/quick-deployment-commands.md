# Quick Deployment Commands for ksaunibliss.com

## After receiving OTP and connecting to VPS:

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
# Enter OTP when prompted
```

### 2. Download and run the automated deployment script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/mayurimulay789/KsauniBlissFinal/main/deploy/deploy-hostinger.sh

# Make it executable
chmod +x deploy-hostinger.sh

# Run the deployment
./deploy-hostinger.sh
```

### Alternative Manual Commands (if script doesn't work):

#### Update system and install Node.js
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pm2
apt install nginx git certbot python3-certbot-nginx -y
```

#### Clone and setup application
```bash
cd /var/www
rm -rf ksaunibliss 2>/dev/null || true
git clone https://github.com/mayurimulay789/KsauniBlissFinal.git ksaunibliss
cd ksaunibliss
chown -R www-data:www-data /var/www/ksaunibliss
chmod -R 755 /var/www/ksaunibliss
```

#### Install dependencies and build
```bash
npm install
cd server && npm install
cd ../client && npm install && npm run build
cd ..
```

#### Setup environment
```bash
cd server
cp .env .env.production
sed -i 's|yourdomain.com|ksaunibliss.com|g' .env.production
sed -i 's|NODE_ENV=development|NODE_ENV=production|g' .env.production
sed -i 's|HOST=localhost|HOST=0.0.0.0|g' .env.production
```

#### Start with PM2
```bash
cd /var/www/ksaunibliss
mkdir -p logs
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Configure Nginx
```bash
# Create Nginx config
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
nginx -t && systemctl restart nginx
```

#### Setup SSL Certificate
```bash
certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com --email ksaunibliss@gmail.com --agree-tos --non-interactive
```

#### Setup Firewall
```bash
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
```

### Verification Commands:
```bash
# Check PM2 status
pm2 status

# Check if backend is running
curl http://localhost:5000/api

# Check Nginx status
systemctl status nginx

# Check SSL certificate
certbot certificates

# View logs
pm2 logs ksaunibliss-server
tail -f /var/log/nginx/error.log
```

### Future Updates:
```bash
cd /var/www/ksaunibliss
git pull origin main
cd client && npm run build
pm2 restart ksaunibliss-server
systemctl reload nginx
```

## Troubleshooting:

### If port 5000 is busy:
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### If Nginx config test fails:
```bash
nginx -t
# Fix any syntax errors shown
```

### If SSL fails:
```bash
# Make sure domain points to server IP first
# Then retry SSL setup
certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com
```
