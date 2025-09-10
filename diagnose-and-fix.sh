#!/bin/bash

# Comprehensive diagnostic and fix script for KsauniBliss application

echo "============================================"
echo "KsauniBliss Application Diagnostic & Fix Tool"
echo "============================================"
echo

# Function to check if a Docker container is running
check_container() {
    container_name=$1
    echo "Checking $container_name container..."
    if docker-compose ps | grep -q "$container_name.*Up"; then
        echo "✅ $container_name is running"
        return 0
    else
        echo "❌ $container_name is not running or has issues"
        return 1
    fi
}

# Function to check a network connection
check_connection() {
    host=$1
    port=$2
    echo "Checking connection to $host:$port..."
    if nc -z -w5 $host $port; then
        echo "✅ Connection to $host:$port successful"
        return 0
    else
        echo "❌ Cannot connect to $host:$port"
        return 1
    fi
}

# Step 1: Show system info
echo "SYSTEM INFORMATION:"
echo "==================="
uname -a
echo
echo "Docker version:"
docker --version
echo
echo "Docker Compose version:"
docker-compose --version
echo
echo "Nginx version:"
nginx -v
echo

# Step 2: Check Docker containers
echo
echo "DOCKER CONTAINER STATUS:"
echo "======================="
docker-compose ps
echo

# Step 3: Check client container
echo "CLIENT CONTAINER CHECKS:"
echo "======================="
if check_container "client"; then
    echo "Checking client container logs for errors:"
    docker-compose logs --tail=20 client | grep -i "error\|warning\|critical"
fi
echo

# Step 4: Check server container
echo "SERVER CONTAINER CHECKS:"
echo "======================="
if check_container "server"; then
    echo "Checking server container logs for errors:"
    docker-compose logs --tail=20 server | grep -i "error\|warning\|critical"
else
    echo "Attempting to rebuild and restart server container..."
    docker-compose build --no-cache server
    docker-compose up -d server
    sleep 5
    check_container "server"
fi
echo

# Step 5: Check network connectivity
echo "NETWORK CONNECTIVITY CHECKS:"
echo "==========================="
check_connection "localhost" "8080"
check_connection "localhost" "5001"
echo

# Step 6: Check Nginx configuration
echo "NGINX CONFIGURATION CHECK:"
echo "========================="
echo "Testing Nginx configuration:"
nginx -t
echo
echo "Checking Nginx error logs:"
tail -n 20 /var/log/nginx/error.log
echo

# Step 7: Fix Nginx configuration
echo "FIXING NGINX CONFIGURATION:"
echo "=========================="
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
    
    # Increase timeouts
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;
    
    # Frontend client
    location / {
        proxy_pass http://127.0.0.1:8080;  # Using 127.0.0.1 instead of localhost
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off; # Disable buffering for better error reporting
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5001;  # Using 127.0.0.1 instead of localhost
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off; # Disable buffering for better error reporting
    }
}
EOL

echo "Updated Nginx configuration."

# Step 8: Apply Nginx configuration
echo "Testing and applying Nginx configuration..."
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx configuration reloaded successfully"
else
    echo "❌ Nginx configuration test failed, please check errors above"
fi
echo

# Step 9: Test connections
echo "TESTING CONNECTIONS:"
echo "==================="
echo "Testing connection to client container:"
curl -I http://127.0.0.1:8080
echo
echo "Testing connection to server container:"
curl -I http://127.0.0.1:5001/api/health || echo "API health endpoint not available"
echo

# Step 10: Restart containers if needed
echo "RESTARTING CONTAINERS:"
echo "===================="
echo "Do you want to restart all containers? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Restarting all containers..."
    docker-compose down
    docker-compose up -d
    echo "Containers restarted."
    sleep 5
    docker-compose ps
fi

echo
echo "Diagnostic and fix process completed."
echo "Please try accessing your website again at https://ksaunibliss.com"
echo "If issues persist, please check the detailed logs with: docker-compose logs"
