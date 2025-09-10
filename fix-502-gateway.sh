#!/bin/bash

# Fix 502 Bad Gateway issue

echo "Fixing 502 Bad Gateway issue..."

# Step 1: Check if Docker containers are running
echo "Checking Docker container status:"
docker-compose ps

# Step 2: Check Nginx error logs
echo "Checking Nginx error logs:"
tail -n 20 /var/log/nginx/error.log

# Step 3: Fix Nginx configuration
echo "Updating Nginx configuration..."

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
        proxy_pass http://localhost:8080;  # Point to the client container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;  # Point to the server container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Additional error handling
    error_page 502 /502.html;
    location = /502.html {
        root /var/www/html;
        internal;
    }
}
EOL

# Step 4: Test Nginx configuration
echo "Testing Nginx configuration:"
nginx -t

# Step 5: Reload Nginx if test was successful
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "Nginx reloaded."
else
    echo "Nginx configuration test failed. Please check the errors above."
fi

# Step 6: Restart Docker containers
echo "Restarting Docker containers..."
docker-compose down
docker-compose up -d

# Step 7: Check Docker container status again
echo "Checking Docker container status after restart:"
sleep 5
docker-compose ps

# Step 8: Create a simple test page to check direct Nginx access
echo "Creating a test page to check Nginx directly..."
cat > /var/www/html/502.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <title>502 Bad Gateway</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
        }
        h1 {
            color: #e74c3c;
        }
        .info {
            background: #f8f9fa;
            border-left: 4px solid #2980b9;
            padding: 10px 20px;
            margin: 20px 0;
        }
        code {
            background: #f1f1f1;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>502 Bad Gateway</h1>
    <p>The server encountered a temporary error and could not complete your request.</p>
    
    <div class="info">
        <p>This custom error page indicates Nginx is working but cannot connect to the upstream server (Docker containers).</p>
    </div>
    
    <h2>Troubleshooting steps:</h2>
    <ol>
        <li>Check if Docker containers are running: <code>docker-compose ps</code></li>
        <li>Check container logs: <code>docker-compose logs</code></li>
        <li>Verify port configurations in docker-compose.yml</li>
        <li>Ensure Nginx is configured to proxy to the correct ports</li>
    </ol>
    
    <p>Please contact support if this issue persists.</p>
</body>
</html>
EOL

echo "Fix attempt completed. Please try accessing your website again."
