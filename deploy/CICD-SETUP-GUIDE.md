# CI/CD Pipeline Setup Guide for Hostinger VPS

This guide will help you set up automatic deployment to your Hostinger VPS whenever you push code to GitHub.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Hostinger VPS**: Access to your Hostinger VPS with SSH
3. **Docker Hub Account**: For storing Docker images (free account works)

## Step 1: Setup Docker Hub

1. Create account at [Docker Hub](https://hub.docker.com/)
2. Create two repositories:
   - `ksaunibliss-client`
   - `ksaunibliss-server`
3. Note your Docker Hub username

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### Required Secrets:

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password_or_token

HOST=your_hostinger_vps_ip
USERNAME=your_hostinger_username  
PASSWORD=your_hostinger_password
PORT=22  (or your custom SSH port)
```

### GitHub Webhook URL:
- Production: `https://webhook.ksaunibliss.com/webhook`
- Development: `http://your-vps-ip:3001/webhook`

### How to find Hostinger VPS details:

1. **HOST**: Your VPS IP address (found in Hostinger control panel)
2. **USERNAME**: Usually `u574849695` or similar (found in Hostinger control panel)
3. **PASSWORD**: Your VPS password
4. **PORT**: Default is 22, unless you changed it

## Step 3: Prepare Your VPS

SSH into your Hostinger VPS and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

## Step 4: Update Docker Compose for Production

Update your `docker-compose.yml` to use pre-built images:

```yaml
services:
  client:
    image: YOUR_DOCKER_USERNAME/ksaunibliss-client:latest
    # Comment out build section for production
    # build:
    #   context: ./client
    #   dockerfile: Dockerfile
    
  server:
    image: YOUR_DOCKER_USERNAME/ksaunibliss-server:latest
    # Comment out build section for production
    # build:
    #   context: ./server
    #   dockerfile: Dockerfile
```

## Step 5: Test the Pipeline

1. Make any change to your code
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

3. Check GitHub Actions tab in your repository to see the pipeline running

## Step 6: Monitor Deployment

### In GitHub:
- Go to Actions tab
- Click on your workflow run
- Monitor each step

### On your VPS:
```bash
# Check running containers
docker ps

# Check logs
docker-compose logs -f

# Check application
curl http://localhost
curl http://localhost:5000/api/health
```

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed**
   - Verify VPS IP, username, password
   - Check if SSH is enabled
   - Try connecting manually: `ssh username@vps-ip`

2. **Docker Build Failed**
   - Check Dockerfile syntax
   - Verify all dependencies are available
   - Check build logs in GitHub Actions

3. **Container Won't Start**
   - Check environment variables
   - Verify database connection
   - Check container logs: `docker logs container-name`

4. **Port Already in Use**
   - Stop existing processes: `sudo lsof -i :80` and `sudo lsof -i :5000`
   - Kill processes or change ports

### Manual Deployment Commands:

If CI/CD fails, you can deploy manually:

```bash
# SSH into your VPS
ssh username@vps-ip

# Navigate to app directory
cd /home/username/ksaunibliss

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## Security Best Practices

1. **Use SSH Keys instead of passwords**
2. **Enable firewall and close unnecessary ports**
3. **Keep your VPS updated**
4. **Use environment variables for sensitive data**
5. **Regular backups of your application data**

## Automatic SSL Setup

After deployment, setup SSL certificates:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (add to crontab)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Variables

For production, create a `.env` file on your VPS:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

## Monitoring and Logs

Set up log rotation and monitoring:

```bash
# Check application logs
docker-compose logs -f --tail=100

# Check system resources
htop
df -h
free -h

# Setup log rotation in /etc/logrotate.d/docker
```

## Next Steps

1. Set up monitoring (Prometheus + Grafana)
2. Configure automated backups
3. Set up staging environment
4. Add more comprehensive tests
5. Implement blue-green deployment
