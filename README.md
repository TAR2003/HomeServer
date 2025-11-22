# 🏠 Home Media Server

A complete, production-grade, fully Dockerized Home Media Server application with Java Spring Boot backend and Vite + React frontend.

## 🎯 Features

### Backend Features (Spring Boot)
- ✅ **File Upload**: Multipart file upload with progress tracking
- ✅ **File Management**: Browse, search, and download media files
- ✅ **Video Streaming**: HTTP range requests for seekable video playback
- ✅ **Thumbnail Generation**: Automatic thumbnail creation for images and videos using FFmpeg
- ✅ **WebSocket Support**: Real-time updates for upload progress and thumbnail generation
- ✅ **RESTful API**: Complete REST API with proper error handling
- ✅ **Database Integration**: H2/PostgreSQL support for metadata storage
- ✅ **File Categorization**: Organized into images-videos, movies, and series folders

### Frontend Features (Vite + React)
- ✅ **Modern UI**: TailwindCSS + ShadCN-inspired components
- ✅ **Animations**: Smooth Framer Motion animations throughout
- ✅ **Drag & Drop Upload**: Intuitive file upload with progress bars
- ✅ **Video Player**: Integrated ReactPlayer with seekable streaming
- ✅ **Image Preview**: Built-in image viewing
- ✅ **Search & Filter**: Real-time search and category filtering
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **Dark Mode**: Toggle between light and dark themes
- ✅ **Grid Layout**: Google Drive-style media browsing

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx:80      │  ← External Access
│ Reverse Proxy   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼───┐  ┌──▼──────┐
│Frontend│  │ Backend │
│React   │  │ Spring  │
│:3000   │  │ :8080   │
└────────┘  └─────┬───┘
                  │
            ┌─────▼─────┐
            │  Database │
            │   (H2)    │
            └───────────┘
```

### Port Mapping
- **Port 80**: Nginx reverse proxy (external access)
- **Port 8080**: Backend API (internal)
- **Port 3000**: Frontend (internal)

## 📁 Project Structure

```
HomeServer/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/homeserver/mediaserver/
│   │   ├── MediaServerApplication.java
│   │   ├── config/
│   │   │   ├── WebConfig.java
│   │   │   └── WebSocketConfig.java
│   │   ├── controller/
│   │   │   └── MediaController.java
│   │   ├── dto/
│   │   │   ├── MediaFileDTO.java
│   │   │   ├── UploadResponse.java
│   │   │   └── UploadProgress.java
│   │   ├── entity/
│   │   │   └── MediaFile.java
│   │   ├── repository/
│   │   │   └── MediaFileRepository.java
│   │   └── service/
│   │       ├── MediaService.java
│   │       └── ThumbnailService.java
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Card.tsx
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── UploadArea.tsx
│   │   │   └── VideoPlayerModal.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
├── media/                      # Media storage (Docker volume)
│   ├── images-videos/
│   ├── movies/
│   ├── series/
│   └── thumbnails/
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- At least 4GB RAM available for Docker
- 10GB+ free disk space

### Installation & Running

1. **Clone the repository** (or you're already in it)
   ```bash
   cd HomeServer
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build the Spring Boot backend
   - Build the Vite React frontend
   - Start the Nginx reverse proxy
   - Create necessary Docker networks and volumes
   - Expose the application on port 80

3. **Access the application**
   ```
   http://localhost
   ```

4. **Stop the services**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (clean slate)**
   ```bash
   docker-compose down -v
   ```

## 🛠️ Development Mode

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```
Backend will run on http://localhost:8080

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173 with hot reload

## 📡 API Endpoints

### Upload
- `POST /api/upload` - Upload a media file
  - Form data: `file`, `category`
  - Response: `UploadResponse`

### File Listing
- `GET /api/files` - Get all files
- `GET /api/files?category=movies` - Get files by category
- `GET /api/files/structure` - Get organized file structure
- `GET /api/files/search?keyword=query` - Search files

### File Operations
- `GET /api/download?path={filePath}` - Download a file
- `GET /api/stream?path={filePath}` - Stream video with range support
- `GET /api/thumbnail?path={thumbnailPath}` - Get thumbnail

### Health Check
- `GET /api/health` - Service health status

## 🎬 Video Streaming

The backend supports **HTTP Range requests** for video streaming, allowing:
- Seekable video playback
- Partial content delivery
- Efficient bandwidth usage
- Resume capability

### How it works:
1. Client requests video with `Range: bytes=0-` header
2. Backend responds with `206 Partial Content`
3. Sends `Content-Range` header
4. Client can seek by requesting different byte ranges

## 🖼️ Thumbnail Generation

### Images
- Uses **Thumbnailator** library
- Generates 320x240 JPEG thumbnails
- Maintains aspect ratio

### Videos
- Uses **FFmpeg**
- Extracts frame at 00:00:01
- Scales to 320x240

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.yml`:

```yaml
app:
  media:
    base-path: /app/media
    folders:
      - images-videos
      - movies
      - series
    thumbnail-path: /app/media/thumbnails
    thumbnail-width: 320
    thumbnail-height: 240
```

### Frontend Configuration
Edit `frontend/src/lib/api.ts` for API base URL (default: `/api`)

### Environment Variables
Set in `docker-compose.yml`:
- `JWT_SECRET`: Change in production
- `JAVA_OPTS`: JVM memory settings
- `SPRING_PROFILES_ACTIVE`: Application profile

## 📦 Docker Images

### Backend Image
- Base: `eclipse-temurin:17-jre-alpine`
- Size: ~200MB
- Includes: Java 17, FFmpeg

### Frontend Image
- Base: `nginx:alpine`
- Size: ~50MB
- Serves: Static built React app

### Nginx Proxy
- Base: `nginx:alpine`
- Size: ~25MB

## 🔒 Security Notes

⚠️ **For Production Deployment:**

1. **Change JWT Secret**
   ```yaml
   JWT_SECRET: your-secure-256-bit-secret-key-here
   ```

2. **Enable HTTPS**
   - Add SSL certificates to nginx configuration
   - Update ports and protocols

3. **Set up Authentication**
   - Backend includes JWT infrastructure
   - Implement user registration/login

4. **Database**
   - Switch from H2 to PostgreSQL for production
   - Configure proper backups

5. **File Size Limits**
   - Default: 10GB per file
   - Adjust based on your needs

## 🎨 UI Components

Built with:
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN/UI**: Accessible component patterns
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing
- **React Dropzone**: Drag-and-drop uploads
- **React Player**: Video playback

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 80
netstat -ano | findstr :80

# Change port in docker-compose.yml
ports:
  - "8080:80"  # Changed from 80:80
```

### FFmpeg Not Found
FFmpeg is included in the Docker image. If running locally:
```bash
# Install FFmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Upload Fails
- Check disk space
- Verify media folder permissions
- Check logs: `docker-compose logs backend`

### Video Won't Play
- Verify video codec compatibility
- Check browser console for errors
- Ensure range requests are enabled

## 📊 Performance

### Recommended Specs
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: SSD recommended for thumbnails
- **Network**: 100Mbps+ for smooth streaming

### Optimization Tips
1. Use SSD for media storage
2. Increase JVM heap for large libraries
3. Enable Nginx caching for thumbnails
4. Consider CDN for static assets

## 🔄 Updates & Maintenance

### Update Application
```bash
git pull
docker-compose down
docker-compose up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backup Media
```bash
# Backup media folder
tar -czf media-backup-$(date +%Y%m%d).tar.gz ./media

# Backup database
docker exec media-server-backend cp /app/data /backup
```

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- User authentication system
- Playlist functionality
- Advanced search filters
- Subtitle support
- Mobile apps
- Cloud storage integration

## 🎓 Technology Stack Summary

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Web, Data JPA, Validation
- H2 Database (can use PostgreSQL)
- JWT for auth infrastructure
- Thumbnailator for images
- FFmpeg for video thumbnails
- WebSocket (STOMP)
- Lombok
- Apache Commons IO

### Frontend
- React 18
- TypeScript
- Vite 5
- TailwindCSS 3
- Framer Motion
- React Router 6
- Axios
- React Dropzone
- React Player
- Lucide React Icons

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy
- Multi-stage builds
- Health checks
- Volume management

## 🌟 Features in Detail

### Multi-part Upload
- Handles files up to 10GB
- Shows progress in real-time
- Supports multiple concurrent uploads
- Automatic duplicate filename handling

### Smart Categorization
- Auto-detects MIME types
- Organizes by category
- Maintains folder structure
- Generates checksums

### Responsive Design
- Works on desktop, tablet, mobile
- Touch-friendly interface
- Adaptive grid layout
- Optimized for different screen sizes

---

**Enjoy your Home Media Server! 🎬🖼️📺**
