# KsauniBliss Hostinger VPS Deployment Guide

## Server Details
- Email: ksaunibliss@gmail.com
- Password: Ksauni@7890_11
- Repository: https://github.com/mayurimulay789/KsauniBlissFinal.git

## Prerequisites
1. VPS with Ubuntu/CentOS
2. Root or sudo access
3. Domain pointed to VPS IP

## Step 1: Initial Server Setup

### Connect to VPS
```bash
ssh root@your-server-ip
# Enter password: Ksauni@7890_11
```

### Update System
```bash
apt update && apt upgrade -y
```

### Install Required Software
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

## Step 2: Application Deployment

### 1. Remove old files and clone repository
```bash
# Navigate to web directory
cd /var/www

# Remove old files if any
rm -rf html/*

# Clone the repository
git clone https://github.com/mayurimulay789/KsauniBlissFinal.git ksaunibliss
cd ksaunibliss

# Set proper permissions
chown -R www-data:www-data /var/www/ksaunibliss
chmod -R 755 /var/www/ksaunibliss
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Build Client Application
```bash
# Build the client for production
cd /var/www/ksaunibliss/client
npm run build
```

### 4. Configure Environment Variables
```bash
# Create production environment file
cd /var/www/ksaunibliss/server
cp .env .env.production

# Edit environment variables for production
nano .env.production
```

Update the following in .env.production:
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

## Step 3: PM2 Configuration

### Create PM2 ecosystem file
```bash
cd /var/www/ksaunibliss
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'ksaunibliss-server',
      script: './server/src/index.js',
      cwd: '/var/www/ksaunibliss',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: './server/.env.production',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

### Start application with PM2
```bash
# Create logs directory
mkdir -p /var/www/ksaunibliss/logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 4: Nginx Configuration

### Create Nginx configuration
```bash
nano /etc/nginx/sites-available/ksaunibliss
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Client build files
    root /var/www/ksaunibliss/client/dist;
    index index.html index.htm;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API routes
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

### Enable the site
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/ksaunibliss /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

## Step 5: SSL Certificate Setup

### Install SSL certificate with Let's Encrypt
```bash
# Replace yourdomain.com with your actual domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

## Step 6: Firewall Configuration

### Configure UFW firewall
```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Check status
ufw status
```

## Step 7: Monitoring and Maintenance

### Monitor applications
```bash
# Check PM2 status
pm2 status
pm2 logs ksaunibliss-server

# Monitor system resources
htop
df -h
free -h

# Check nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Regular maintenance commands
```bash
# Update application
cd /var/www/ksaunibliss
git pull origin main
cd client && npm run build
pm2 restart ksaunibliss-server

# Update system
apt update && apt upgrade -y

# Backup database (if using local MongoDB)
mongodump --db ksaunibliss --out /backups/$(date +%Y%m%d)
```

## Troubleshooting

### Common issues and solutions:

1. **Port already in use:**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission issues:**
   ```bash
   sudo chown -R www-data:www-data /var/www/ksaunibliss
   sudo chmod -R 755 /var/www/ksaunibliss
   ```

3. **PM2 not starting:**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js
   ```

4. **Nginx not serving files:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Performance Optimization

### 1. Enable Redis caching (Optional)
```bash
# Install Redis
apt install redis-server -y

# Configure Redis
systemctl enable redis-server
systemctl start redis-server
```

### 2. Database optimization
- Use MongoDB Atlas for better performance
- Enable database indexing
- Implement connection pooling

### 3. CDN Setup
- Configure Cloudinary for image optimization
- Use CDN for static assets

## Security Best Practices

1. **Keep system updated:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Configure fail2ban:**
   ```bash
   apt install fail2ban -y
   systemctl enable fail2ban
   ```

3. **Regular backups:**
   - Database backups
   - Code backups
   - Environment configuration backups

4. **Monitor logs:**
   - Application logs
   - System logs
   - Security logs

## Support and Maintenance

For ongoing support and maintenance:
- Monitor application performance
- Regular security updates
- Database optimization
- Performance monitoring
- Error tracking

---

## Quick Deployment Script

Save the following as `deploy.sh` for quick deployments:

```bash
#!/bin/bash

echo "Starting KsauniBliss deployment..."

# Navigate to application directory
cd /var/www/ksaunibliss

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install
cd server && npm install
cd ../client && npm install

# Build client
npm run build

# Restart PM2 processes
pm2 restart ksaunibliss-server

# Reload Nginx
sudo systemctl reload nginx

echo "Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run deployment:
```bash
./deploy.sh
```
