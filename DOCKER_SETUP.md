# ✅ Changes Made - Docker-Only Setup

## Summary

The Home Media Server has been updated to work with **Docker Compose only** - no PowerShell scripts or manual initialization needed!

## 🔧 Changes Made

### 1. **Removed PowerShell/Bash Script Dependency**
- ❌ No need to run `init.ps1` or `init.sh`
- ✅ Just run `docker-compose up -d`

### 2. **Enhanced PostgreSQL Data Persistence**
The PostgreSQL database now has:
- **Named volume**: `media-server-postgres-data` (persists across restarts)
- **Restart policy**: `unless-stopped` (auto-restarts on failure)
- **Health checks**: Ensures database is ready before other services start
- **Automatic schema initialization**: Runs `database/init.sql` on first startup

### 3. **Media Storage Persistence**
- **Named volume**: `media-server-media-storage` (persists all uploads)
- Survives container stops, restarts, and even rebuilds

### 4. **Updated Documentation**
- ✅ `README.md` - Simplified to Docker-only workflow
- ✅ `QUICKSTART.md` - Now just one command
- ✅ `GETTING_STARTED.md` - New ultra-simple guide
- ✅ `PROJECT_SUMMARY.md` - Updated command reference

## 🚀 How to Use

### Start Everything

```bash
docker-compose up -d
```

This single command:
1. Downloads all required Docker images
2. Creates PostgreSQL database with persistent storage
3. Initializes database schema automatically
4. Creates media storage volumes
5. Starts all 4 services (Frontend, Backend, PostgreSQL, Nginx)
6. Sets up networking between containers

### Access Your Server

Open browser: **http://localhost**

### Stop (Keeps All Data)

```bash
docker-compose down
```

**Your data is safe!** Both database and media files persist in named Docker volumes.

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f backend
```

### Restart Services

```bash
docker-compose restart
```

### Update Code and Rebuild

```bash
docker-compose up -d --build
```

### Check Status

```bash
docker-compose ps
```

## 📦 What Gets Persisted

### Docker Volumes Created

1. **`media-server-postgres-data`**
   - Location: Docker managed volume
   - Contains: All database tables and data
   - Persists: Yes, even after `docker-compose down`

2. **`media-server-media-storage`**
   - Location: Docker managed volume
   - Contains: Uploaded images, videos, movies, series, thumbnails
   - Persists: Yes, even after `docker-compose down`

### View Volume Details

```bash
# List volumes
docker volume ls | findstr media-server

# Inspect a volume
docker volume inspect media-server-postgres-data
```

### Backup Volumes

```bash
# Backup database
docker exec media-server-db pg_dump -U postgres mediaserver > backup.sql

# Backup media (creates tar.gz)
docker run --rm -v media-server-media-storage:/data -v ${PWD}:/backup alpine tar czf /backup/media-backup.tar.gz -C /data .
```

### Restore Data

```bash
# Restore database
docker exec -i media-server-db psql -U postgres mediaserver < backup.sql

# Restore media
docker run --rm -v media-server-media-storage:/data -v ${PWD}:/backup alpine tar xzf /backup/media-backup.tar.gz -C /data
```

## ⚠️ Important Notes

### Data Persistence

✅ **Safe Operations** (data persists):
- `docker-compose down` - Stops containers
- `docker-compose restart` - Restarts services
- `docker-compose up -d --build` - Rebuilds containers
- Container crashes or failures

❌ **Destructive Operation** (deletes data):
- `docker-compose down -v` - Removes volumes (ALL DATA LOST)

### Volume Location

Docker manages volume storage automatically. On Windows with Docker Desktop:
- Volumes are stored in WSL 2 filesystem
- Access via: `\\wsl$\docker-desktop-data\data\docker\volumes`

You don't need to manage this manually - Docker handles it!

## 🎯 Testing the Setup

1. **Start the server**:
   ```bash
   docker-compose up -d
   ```

2. **Wait for services** (about 30-60 seconds first time):
   ```bash
   docker-compose logs -f
   ```
   Look for: "database system is ready to accept connections"

3. **Access the app**: http://localhost

4. **Upload a test file**

5. **Stop the server**:
   ```bash
   docker-compose down
   ```

6. **Start again**:
   ```bash
   docker-compose up -d
   ```

7. **Verify**: Your uploaded file is still there! ✅

## 🔍 Troubleshooting

### Port 80 already in use

Edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change to 8080 or any free port
```

### Database not initializing

Check logs:
```bash
docker-compose logs postgres
```

Force recreation:
```bash
docker-compose down -v
docker-compose up -d
```

### Services not connecting

Check network:
```bash
docker network ls | findstr media-server
docker network inspect media-server-network
```

### Need to reset everything

```bash
# WARNING: Deletes all data!
docker-compose down -v
docker-compose up -d
```

## ✅ Verification Checklist

After running `docker-compose up -d`, verify:

- [ ] All 4 containers are running: `docker-compose ps`
- [ ] Nginx is accessible: http://localhost
- [ ] Database is healthy: `docker-compose logs postgres`
- [ ] Backend is responding: `docker-compose logs backend`
- [ ] Volumes are created: `docker volume ls`

## 🎉 Summary

You now have a **fully automated, data-persistent** home media server that:

✅ Requires only `docker-compose up -d` to start  
✅ Automatically initializes the database  
✅ Persists all data across restarts  
✅ Can be safely stopped and started  
✅ Backs up with simple Docker commands  

**No PowerShell scripts, no manual setup, just Docker!**
