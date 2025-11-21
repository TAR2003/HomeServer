# Deployment Guide

This guide provides detailed instructions for deploying the Home Media Server on various platforms.

## 🖥️ Deployment Options

### Option 1: Local Home Server (Recommended)

Perfect for running on a home server, NAS, or dedicated machine.

#### Hardware Requirements

- **Minimum**:
  - 2 CPU cores
  - 4GB RAM
  - 50GB storage (+ media storage)
  - Network connection

- **Recommended**:
  - 4+ CPU cores
  - 8GB+ RAM
  - 500GB+ storage (SSD preferred)
  - Gigabit Ethernet

#### Installation Steps

1. **Install Docker**

   **Windows**:
   - Download Docker Desktop from https://www.docker.com/products/docker-desktop
   - Install and restart
   - Ensure WSL 2 is enabled

   **Linux (Ubuntu/Debian)**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

   **macOS**:
   - Download Docker Desktop from https://www.docker.com/products/docker-desktop
   - Install and start Docker

2. **Clone/Copy the project**

   ```bash
   git clone <your-repo-url>
   cd HomeServer
   ```

3. **Initialize**

   Windows:
   ```powershell
   .\init.ps1
   ```

   Linux/Mac:
   ```bash
   chmod +x init.sh
   ./init.sh
   ```

4. **Configure**

   Edit `.env` file:
   ```env
   JWT_SECRET=generate-a-secure-random-key-here
   ```

5. **Start the server**

   ```bash
   docker-compose up -d
   ```

6. **Access**

   - Local: http://localhost
   - Network: http://YOUR_LOCAL_IP

### Option 2: Cloud Deployment (VPS)

Deploy on cloud providers like DigitalOcean, AWS EC2, or Linode.

#### Provider Setup

**DigitalOcean Droplet**:
- Create a Droplet with Ubuntu 22.04
- Minimum: 2GB RAM, 2 vCPUs
- Add block storage for media files

**AWS EC2**:
- Launch t3.small or larger instance
- Ubuntu 22.04 LTS AMI
- Add EBS volume for media storage
- Configure security group (ports 80, 443, 22)

#### Deployment Steps

1. **Connect to server**

   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Update system**

   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Docker**

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Clone project**

   ```bash
   git clone <your-repo-url>
   cd HomeServer
   ```

5. **Configure**

   ```bash
   cp .env.example .env
   nano .env
   ```

   Update with secure values:
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

6. **Start**

   ```bash
   docker-compose up -d
   ```

7. **Configure firewall**

   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

### Option 3: NAS Deployment

Deploy on Synology, QNAP, or other NAS devices.

#### Synology NAS

1. **Enable SSH and Docker**
   - Control Panel > Terminal & SNMP > Enable SSH
   - Package Center > Install Docker

2. **Connect via SSH**
   ```bash
   ssh admin@YOUR_NAS_IP
   ```

3. **Deploy**
   ```bash
   cd /volume1/docker
   mkdir HomeServer
   cd HomeServer
   # Upload project files via File Station or SCP
   sudo docker-compose up -d
   ```

4. **Configure reverse proxy** (Optional)
   - Control Panel > Application Portal > Reverse Proxy
   - Add rule: localhost:80 → homeserver

## 🌐 Domain & SSL Setup

### Using Cloudflare Tunnel (Free)

1. **Install Cloudflare Tunnel**
   ```bash
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate**
   ```bash
   cloudflared tunnel login
   ```

3. **Create tunnel**
   ```bash
   cloudflared tunnel create media-server
   ```

4. **Configure tunnel**
   Create `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

   ingress:
     - hostname: media.yourdomain.com
       service: http://localhost:80
     - service: http_status:404
   ```

5. **Start tunnel**
   ```bash
   cloudflared tunnel run media-server
   ```

### Using Let's Encrypt (Traditional)

1. **Install Certbot**
   ```bash
   apt install certbot python3-certbot-nginx
   ```

2. **Get certificate**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

3. **Update nginx.conf**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # ... rest of config
   }
   ```

4. **Restart**
   ```bash
   docker-compose restart nginx
   ```

## 📊 Monitoring & Maintenance

### Health Checks

Check container status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

Check resource usage:
```bash
docker stats
```

### Backup Strategy

**Database Backup**:
```bash
docker exec media-server-db pg_dump -U postgres mediaserver > backup.sql
```

**Media Files Backup**:
```bash
docker run --rm -v media_storage:/data -v $(pwd):/backup \
  alpine tar czf /backup/media-backup.tar.gz /data
```

**Automated Backups**:
Create a cron job:
```bash
crontab -e
```

Add:
```cron
0 2 * * * /home/user/HomeServer/backup.sh
```

### Updates

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Rebuild containers**
   ```bash
   docker-compose up -d --build
   ```

3. **Clean old images**
   ```bash
   docker image prune -a
   ```

## 🔒 Security Best Practices

### 1. Change Default Credentials

Update `.env`:
```env
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
```

### 2. Enable Authentication

Uncomment authentication in `middleware.ts`

### 3. Firewall Configuration

Only allow necessary ports:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 4. Fail2Ban (Linux)

Install and configure:
```bash
apt install fail2ban
systemctl enable fail2ban
```

### 5. Regular Updates

```bash
apt update && apt upgrade -y
docker-compose pull
docker-compose up -d
```

## 🚀 Performance Tuning

### PostgreSQL Optimization

Add to `docker-compose.yml`:
```yaml
postgres:
  command: 
    - "postgres"
    - "-c"
    - "max_connections=200"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "effective_cache_size=1GB"
```

### Nginx Optimization

Update `nginx.conf`:
```nginx
worker_processes auto;
worker_connections 4096;
```

### Docker Resource Limits

Add to `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## 🐛 Troubleshooting

### Cannot connect to server

1. Check Docker status:
   ```bash
   systemctl status docker
   ```

2. Check containers:
   ```bash
   docker-compose ps
   ```

3. Check logs:
   ```bash
   docker-compose logs
   ```

### High CPU usage

1. Check container stats:
   ```bash
   docker stats
   ```

2. Limit resources in docker-compose.yml

3. Reduce concurrent uploads/streams

### Out of disk space

1. Check usage:
   ```bash
   df -h
   ```

2. Clean Docker:
   ```bash
   docker system prune -a
   ```

3. Move media to larger volume

## 📞 Support Checklist

Before asking for help, check:

- [ ] Docker is running
- [ ] All containers are up
- [ ] Logs don't show errors
- [ ] Firewall allows connections
- [ ] Environment variables are set
- [ ] Sufficient disk space
- [ ] Network connectivity

---

**Happy deploying! 🚀**
