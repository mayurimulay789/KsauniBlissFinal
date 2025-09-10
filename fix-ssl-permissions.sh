#!/bin/bash
# Fix SSL certificate permissions for Docker

# Ensure the certificates can be read by the nginx container
chmod -R 755 /etc/letsencrypt/live
chmod -R 755 /etc/letsencrypt/archive

# Restart the Docker containers
cd /var/www/ksaunibliss
docker-compose down
docker-compose build client
docker-compose up -d

# Check the container logs
echo "Waiting for containers to start..."
sleep 5
echo "Client container logs:"
docker logs ksaunibliss_client_1

echo "Server container logs:"
docker logs ksaunibliss_server_1

echo "Done! Check if the website is accessible now."
