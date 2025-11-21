# 🚀 Getting Started - Home Media Server

## One Command Setup

```bash
docker-compose up -d
```

That's all you need! Docker automatically handles:
- ✅ Database initialization
- ✅ Directory creation  
- ✅ Service orchestration
- ✅ Data persistence

## Access Your Server

Open your browser: **http://localhost**

## Managing the Server

```bash
# Stop (keeps all data)
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Update and rebuild
docker-compose up -d --build
```

## Data Persistence

Your data is automatically saved in Docker volumes:
- **Database**: All media metadata persists
- **Media Files**: All uploads persist

Even if you stop containers, your data remains safe.

## Optional Configuration

Want to customize settings? Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` to change settings (optional).

## Full Documentation

- 📖 [Complete README](README.md) - Full feature documentation
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Production deployment
- ⚡ [Quick Start](QUICKSTART.md) - 5-minute guide

## Troubleshooting

### Port 80 in use?

Edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change to port 8080
```

Then access at http://localhost:8080

### View logs

```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

---

**That's it! Enjoy your media server! 🎉**
