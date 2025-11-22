# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites
Make sure you have Docker installed:
```bash
docker --version
docker-compose --version
```

If not installed:
- **Windows/Mac**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Install Docker Engine and Docker Compose

### Step 2: Start the Application

**Windows**
```batch
start.bat
```

**Mac/Linux**
```bash
chmod +x start.sh
./start.sh
```

**Or manually**
```bash
docker-compose up --build
```

This will:
- ✅ Build the backend Docker image (~3-5 minutes first time)
- ✅ Build the frontend Docker image (~2-3 minutes first time)
- ✅ Start all containers
- ✅ Initialize the database
- ✅ Create media directories

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost
```

You should see the Home Media Server interface! 🎉

### Step 4: Upload Your First File

1. Click the **"Upload"** button in the top navigation
2. Select a category (Images & Videos, Movies, or TV Series)
3. Drag and drop files or click to browse
4. Watch the upload progress
5. Navigate back to see your uploaded files

### Step 5: Play a Video

1. Click on any video thumbnail
2. The video player modal will open
3. Video will start playing with seek support
4. Use the built-in controls to pause, seek, and adjust volume

## 📊 Verify Everything is Working

### Check Container Status
```bash
docker-compose ps
```

You should see:
```
NAME                          STATUS              PORTS
media-server-backend          Up (healthy)        0.0.0.0:8080->8080/tcp
media-server-frontend         Up                  0.0.0.0:3000->80/tcp
media-server-nginx            Up                  0.0.0.0:80->80/tcp
```

### Check Backend Health
```bash
curl http://localhost/api/health
```

Response:
```json
{
  "status": "UP",
  "service": "Home Media Server"
}
```

### Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## 🛑 Stop the Application

**Windows**
```batch
stop.bat
```

**Mac/Linux**
```bash
./stop.sh
```

**Or manually**
```bash
docker-compose down
```

## 🔄 Restart from Scratch

If you want to reset everything (removes all uploaded files and database):

**Windows**
```batch
clean-start.bat
```

**Mac/Linux**
```bash
./clean-start.sh
```

## 📁 Where Are My Files?

Uploaded files are stored in:
```
HomeServer/media/
├── images-videos/    # Images and general videos
├── movies/           # Movie files
├── series/           # TV series episodes
└── thumbnails/       # Auto-generated thumbnails
```

## 🐛 Troubleshooting

### Port 80 Already in Use
If port 80 is already taken, edit `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change 80 to 8080
```
Then access at `http://localhost:8080`

### Backend Not Starting
Check if Java and FFmpeg are properly installed in the container:
```bash
docker-compose logs backend
```

### Frontend Not Loading
Verify the build completed successfully:
```bash
docker-compose logs frontend
```

### Upload Fails
1. Check available disk space
2. Verify file size is under 10GB
3. Check backend logs for errors

### Video Won't Play
1. Verify video codec is supported (H.264 recommended)
2. Check browser console for errors
3. Try a different browser

## 💡 Tips

### Better Performance
- Use SSD storage for the media folder
- Increase Docker memory allocation (Docker Desktop → Settings → Resources)
- For large libraries, increase backend memory in `docker-compose.yml`:
  ```yaml
  environment:
    - JAVA_OPTS=-Xmx2048m -Xms1024m
  ```

### Accessing from Other Devices
Find your computer's IP address:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Then access from another device:
```
http://YOUR_IP_ADDRESS
```

### Development Mode
To run in development mode with hot reload:

**Backend**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [API.md](API.md) for API documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Star the repository if you find it useful! ⭐

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Review the troubleshooting section above
3. Check the full README.md for more details
4. Create an issue on GitHub

---

**Enjoy your Home Media Server! 🎬📺🎵**
