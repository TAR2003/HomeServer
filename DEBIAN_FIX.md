# Debian Server Deployment Fix

## Problem
Nginx was failing with: `host not found in upstream "backend:8080"`

This happens because nginx tries to resolve DNS at startup, but the backend container isn't ready yet.

## Solution Applied

### 1. Updated `docker-compose.yml`
- Changed nginx `depends_on` to wait for backend **health check** instead of just container start
- Backend must report healthy before nginx starts

### 2. Updated `nginx/nginx.conf`
- Added Docker's internal DNS resolver: `resolver 127.0.0.11`
- Changed from `upstream` blocks to **variable-based proxy_pass**
- This allows nginx to re-resolve DNS dynamically instead of only at startup

## Deploy on Debian Server

### Pull Latest Changes
```bash
cd ~/projects/HomeServer
git pull origin main
```

### Rebuild and Restart
```bash
sudo docker compose down
sudo docker compose up -d --build
```

### Verify Services
```bash
# Check all containers are running
sudo docker compose ps

# Check logs
sudo docker compose logs -f

# Test health endpoint
curl http://localhost/api/health
# Should return: {"status":"UP","service":"Home Media Server"}

# Test frontend
curl http://localhost
# Should return HTML
```

## Expected Result

All three containers should start in this order:
1. **backend** - Starts and becomes healthy (40s start period)
2. **frontend** - Starts after backend
3. **nginx** - Starts only after backend is healthy

No more "host not found" errors!

## If Issues Persist

### Check container status
```bash
sudo docker compose ps
```

### View logs
```bash
sudo docker compose logs backend
sudo docker compose logs nginx
```

### Restart specific service
```bash
sudo docker compose restart nginx
```

### Complete restart
```bash
sudo docker compose down
sudo docker compose up -d
```

## Network Connectivity Test

```bash
# From inside nginx container
sudo docker exec media-server-nginx ping -c 3 backend

# Should show successful pings
```

## Ports Used
- **80** - Nginx (main access point)
- **3000** - Frontend (internal)
- **8080** - Backend (internal + external for testing)

Make sure port 80 is open in your Debian firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw status
```
