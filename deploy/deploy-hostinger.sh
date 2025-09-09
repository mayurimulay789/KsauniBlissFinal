#!/bin/bash

# KsauniBliss Automated Deployment Script for Hostinger VPS
# Usage: chmod +x deploy-hostinger.sh && ./deploy-hostinger.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ksaunibliss.com"  # Replace with your actual domain
EMAIL="ksaunibliss@gmail.com"
APP_DIR="/var/www/ksaunibliss"
REPO_URL="https://github.com/mayurimulay789/KsauniBlissFinal.git"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_status "Starting KsauniBliss deployment on Hostinger VPS..."

# Step 1: Update system
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated successfully"

# Step 2: Install Node.js 18.x
print_status "Installing Node.js 18.x..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Step 3: Install PM2
print_status "Installing PM2 process manager..."
if ! command_exists pm2; then
    npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_warning "PM2 already installed"
fi

# Step 4: Install Nginx
print_status "Installing Nginx..."
if ! command_exists nginx; then
    apt install nginx -y
    systemctl enable nginx
    print_success "Nginx installed and enabled"
else
    print_warning "Nginx already installed"
fi

# Step 5: Install Git
print_status "Installing Git..."
if ! command_exists git; then
    apt install git -y
    print_success "Git installed successfully"
else
    print_warning "Git already installed"
fi

# Step 6: Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
if ! command_exists certbot; then
    apt install certbot python3-certbot-nginx -y
    print_success "Certbot installed successfully"
else
    print_warning "Certbot already installed"
fi

# Step 7: Remove old application and clone new one
print_status "Setting up application directory..."
if [ -d "$APP_DIR" ]; then
    print_warning "Removing existing application directory..."
    rm -rf "$APP_DIR"
fi

mkdir -p /var/www
cd /var/www

print_status "Cloning repository..."
git clone "$REPO_URL" ksaunibliss
cd ksaunibliss

# Set proper permissions
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
print_success "Repository cloned and permissions set"

# Step 8: Install dependencies
print_status "Installing application dependencies..."

# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install

print_success "All dependencies installed"

# Step 9: Build client application
print_status "Building client application for production..."
npm run build
print_success "Client application built successfully"

# Step 10: Create production environment file
print_status "Setting up production environment..."
cd "$APP_DIR/server"

if [ ! -f .env.production ]; then
    cp .env .env.production
    
    # Update environment variables for production
    sed -i "s|NODE_ENV=development|NODE_ENV=production|g" .env.production
    sed -i "s|HOST=localhost|HOST=0.0.0.0|g" .env.production
    sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://$DOMAIN|g" .env.production
    sed -i "s|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=https://$DOMAIN|g" .env.production
    
    print_success "Production environment file created"
else
    print_warning "Production environment file already exists"
fi

# Step 11: Create logs directory
mkdir -p "$APP_DIR/logs"

# Step 12: Start application with PM2
print_status "Starting application with PM2..."
cd "$APP_DIR"

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup | tail -1 | bash

print_success "Application started with PM2"

# Step 13: Configure Nginx
print_status "Configuring Nginx..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/ksaunibliss << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Client build files
    root $APP_DIR/client/dist;
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
        try_files \$uri =404;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/ksaunibliss /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if nginx -t; then
    systemctl restart nginx
    print_success "Nginx configured and restarted successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 14: Configure firewall
print_status "Configuring firewall..."
if command_exists ufw; then
    ufw --force enable
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    print_success "Firewall configured"
else
    print_warning "UFW not available, skipping firewall configuration"
fi

# Step 15: Install fail2ban for security
print_status "Installing fail2ban for security..."
if ! command_exists fail2ban-client; then
    apt install fail2ban -y
    systemctl enable fail2ban
    systemctl start fail2ban
    print_success "fail2ban installed and started"
else
    print_warning "fail2ban already installed"
fi

# Step 16: Setup SSL certificate (optional, requires domain to be pointed to server)
print_status "Setting up SSL certificate..."
print_warning "Make sure your domain $DOMAIN is pointed to this server's IP address"
read -p "Do you want to install SSL certificate now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
    
    # Test auto-renewal
    certbot renew --dry-run
    
    print_success "SSL certificate installed successfully"
else
    print_warning "SSL certificate installation skipped. You can run it later with:"
    print_warning "certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# Step 17: Create deployment script for future updates
print_status "Creating deployment script for future updates..."
cat > "$APP_DIR/deploy.sh" << 'EOF'
#!/bin/bash

echo "Starting KsauniBliss deployment update..."

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

echo "Deployment update completed successfully!"
EOF

chmod +x "$APP_DIR/deploy.sh"
print_success "Deployment script created at $APP_DIR/deploy.sh"

# Step 18: Final status check
print_status "Checking final deployment status..."

# Check PM2 status
print_status "PM2 processes:"
pm2 status

# Check Nginx status
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check if application is responding
sleep 5
if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_warning "Backend API health check failed - this might be normal if no health endpoint exists"
fi

print_success "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
echo
print_status "Your application should now be accessible at:"
print_status "HTTP: http://$DOMAIN"
print_status "HTTPS: https://$DOMAIN (if SSL was configured)"
echo
print_status "To monitor your application:"
print_status "- PM2 status: pm2 status"
print_status "- PM2 logs: pm2 logs ksaunibliss-server"
print_status "- Nginx logs: tail -f /var/log/nginx/error.log"
echo
print_status "To update your application in the future:"
print_status "- Run: $APP_DIR/deploy.sh"
echo
print_warning "Important: Make sure to update the domain name in the script and Nginx config with your actual domain!"
print_warning "Edit /etc/nginx/sites-available/ksaunibliss and replace '$DOMAIN' with your real domain name"
