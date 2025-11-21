# 🚀 Quick Start Guide

Get your Home Media Server up and running in 5 minutes!

## Prerequisites

✅ Docker Desktop installed  
✅ 4GB+ free RAM  
✅ 10GB+ free storage  

## Installation (1 Command!)

### Just Start Docker Compose

```bash
docker-compose up -d
```

That's it! Docker will:
- ✅ Create all directories automatically
- ✅ Initialize the database with schema
- ✅ Start all services (Frontend, Backend, Database, Nginx)
- ✅ Set up persistent volumes for your data

### Optional: Custom Configuration

If you want to change settings:

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

Then start:
```bash
docker-compose up -d
```

## 🎉 Done!

Open your browser: **http://localhost**

## First Upload

1. Click **Upload** button
2. Drag & drop your media files
3. Click **Upload** to start
4. Wait for thumbnails to generate
5. Start streaming! 🎬

## Common Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start the server |
| `docker-compose down` | Stop the server |
| `docker-compose logs -f` | View logs |
| `docker-compose restart` | Restart all services |
| `docker-compose ps` | Check status |

## Troubleshooting

### Port 80 already in use?

Edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Use port 8080 instead
```

Then access at: http://localhost:8080

### Can't see uploaded files?

Check the logs:
```bash
docker-compose logs backend
```

## Need More Help?

📖 Read the full [README.md](README.md)  
🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for advanced setup  

---

**Enjoy your media server! 🎊**
