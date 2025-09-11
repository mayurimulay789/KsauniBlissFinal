#!/bin/bash

# Complete CI/CD Setup Script for KsauniBliss on Hostinger VPS
# This script sets up everything needed for automatic deployment

set -e

echo "🚀 KsauniBliss CI/CD Setup Script"
echo "=================================="

# Configuration
APP_NAME="ksaunibliss"
APP_USER="u574849695"  # Update this with your actual Hostinger username
APP_DIR="/home/$APP_USER/$APP_NAME"
REPO_URL="https://github.com/mayurimulay789/KsauniBlissFinal.git"
WEBHOOK_PORT="3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

print_status "Starting setup for user: $(whoami)"

# 1. Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# 3. Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_warning "Docker installed. You may need to logout and login again."
else
    print_status "Docker already installed"
fi

# 4. Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose already installed"
fi

# 5. Install Node.js (for webhook server)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js already installed"
fi

# 6. Setup application directory
print_status "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# 7. Clone repository
if [ -d ".git" ]; then
    print_status "Repository exists, pulling latest changes..."
    git pull origin main
else
    print_status "Cloning repository..."
    git clone $REPO_URL .
fi

# 8. Setup webhook server
print_status "Setting up webhook server..."
cd $APP_DIR/deploy/webhook-server
npm install

# 9. Make scripts executable
print_status "Making deployment scripts executable..."
chmod +x $APP_DIR/deploy/*.sh

# 10. Setup systemd service for webhook server
print_status "Setting up webhook server as systemd service..."
sudo cp $APP_DIR/deploy/ksaunibliss-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ksaunibliss-webhook.service

# 11. Setup firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow $WEBHOOK_PORT/tcp

# 12. Setup log directories
print_status "Setting up log directories..."
sudo mkdir -p /var/log
sudo touch /var/log/ksaunibliss-webhook.log
sudo touch /var/log/ksaunibliss-webhook-error.log
sudo touch /var/log/ksaunibliss-deploy.log
sudo chown $APP_USER:$APP_USER /var/log/ksaunibliss-*

# 13. Create nginx configuration for webhook server
print_status "Setting up nginx configuration..."
sudo tee /etc/nginx/sites-available/ksaunibliss-webhook > /dev/null <<EOF
server {
    listen 80;
    server_name webhook.ksaunibliss.com;
    
    location / {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ksaunibliss-webhook /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 14. Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
print_status "Generated webhook secret: $WEBHOOK_SECRET"

# Update the systemd service with the secret
sudo sed -i "s/your-secret-key-here/$WEBHOOK_SECRET/" /etc/systemd/system/ksaunibliss-webhook.service
sudo systemctl daemon-reload

# 15. Start webhook server
print_status "Starting webhook server..."
sudo systemctl start ksaunibliss-webhook.service
sudo systemctl status ksaunibliss-webhook.service --no-pager

# 16. Initial deployment
print_status "Running initial deployment..."
cd $APP_DIR
./deploy/webhook-deploy.sh

# 17. Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/ksaunibliss > /dev/null <<EOF
/var/log/ksaunibliss-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

print_status "Setup completed! 🎉"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🔐 Configure GitHub Webhook:"
echo "   - Go to your GitHub repository → Settings → Webhooks"
echo "   - Add webhook URL: https://webhook.ksaunibliss.com/webhook"
echo "   - Or direct IP: http://your-server-ip:$WEBHOOK_PORT/webhook"
echo "   - Set secret: $WEBHOOK_SECRET"
echo "   - Select 'Just the push event'"
echo ""
echo "2. 🌐 Setup Domain SSL:"
echo "   - Main site: sudo certbot --nginx -d ksaunibliss.com -d www.ksaunibliss.com"
echo "   - Webhook: sudo certbot --nginx -d webhook.ksaunibliss.com"
echo ""
echo "3. 🔧 Configure Environment Variables:"
echo "   - Edit: sudo systemctl edit ksaunibliss-webhook.service"
echo "   - Add your custom environment variables"
echo ""
echo "4. 📊 Monitor Services:"
echo "   - Webhook server: sudo systemctl status ksaunibliss-webhook"
echo "   - Application: docker ps"
echo "   - Logs: tail -f /var/log/ksaunibliss-*.log"
echo ""
echo "5. 🧪 Test Deployment:"
echo "   - Make a change to your code"
echo "   - Push to main branch"
echo "   - Watch automatic deployment happen!"
echo ""
echo "🔗 Useful URLs:"
echo "- Application: https://ksaunibliss.com"
echo "- Webhook Health: https://webhook.ksaunibliss.com/health"
echo "- API Health: https://ksaunibliss.com/api/health"
echo "- Direct API: http://$(curl -s ifconfig.me):5000/api/health"
echo ""
print_status "All done! Your CI/CD pipeline is ready! 🚀"
