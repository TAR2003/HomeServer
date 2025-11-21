# 🏠 Home Media Server

A fully dockerized, modern home media server application built with Next.js 14+, featuring a beautiful UI, video streaming, and comprehensive media management capabilities.

## 🚀 Quick Start

```bash
docker-compose up -d
```

**That's it!** No setup scripts needed. Docker handles everything automatically.  
Access at: http://localhost

---

## ✨ Features

- 🎬 **Media Streaming**: Progressive video streaming with range request support (like YouTube/Netflix)
- 📤 **File Upload**: Drag-and-drop file upload with real-time progress tracking
- 🖼️ **Automatic Thumbnails**: Generate thumbnails for both images and videos
- 🔍 **Search & Filter**: Fast search and category-based filtering
- 📱 **Responsive Design**: Mobile-first, responsive UI with smooth animations
- 🐳 **Fully Dockerized**: One-command deployment with Docker Compose
- 🔐 **Authentication Ready**: JWT-based authentication (optional)
- 💾 **PostgreSQL Database**: Persistent metadata storage
- 🚀 **High Performance**: Nginx reverse proxy with caching and compression
- 🎨 **Modern UI**: Built with TailwindCSS, ShadCN/UI, and Framer Motion

## 🏗️ Architecture

```
┌─────────────┐
│   Nginx     │  Port 80 (Public)
│   Proxy     │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌─────▼──────┐
│  Frontend   │   │  Backend   │
│  Next.js    │   │  API       │
│  Port 3000  │   │  Port 8080 │
└─────────────┘   └──────┬─────┘
                         │
                  ┌──────▼──────┐
                  │ PostgreSQL  │
                  │  Database   │
                  └─────────────┘
```

## 📁 Project Structure

```
HomeServer/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── media/            # Media management endpoints
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # ShadCN UI components
│   ├── Header.tsx            # Navigation header
│   ├── MediaLibrary.tsx      # Main media grid
│   ├── MediaCard.tsx         # Media item card
│   ├── MediaPlayer.tsx       # Video/image player
│   └── UploadDialog.tsx      # Upload modal
├── lib/                      # Utilities and helpers
│   ├── database.ts           # PostgreSQL client
│   ├── media-utils.ts        # Media processing
│   ├── auth.ts               # Authentication
│   └── utils.ts              # General utilities
├── media/                    # Media storage (Docker volume)
│   ├── images-videos/        # Images and videos
│   ├── movies/               # Movie files
│   ├── series/               # TV series
│   └── thumbnails/           # Generated thumbnails
├── Dockerfile.frontend       # Frontend container
├── Dockerfile.backend        # Backend container
├── docker-compose.yml        # Docker orchestration
├── nginx.conf                # Nginx configuration
├── .env                      # Environment variables
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- 4GB+ RAM
- 10GB+ storage for media files

### Installation

1. **Clone or download this repository**

   ```bash
   cd HomeServer
   ```

2. **Configure environment variables (optional)**

   Copy the example file and update if needed:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to change the JWT secret (optional for first run):

   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Start the application**

   ```bash
   docker-compose up -d
   ```

   That's it! Docker will automatically:
   - Create all necessary directories
   - Initialize the database
   - Start all services

4. **Access the application**

   Open your browser and navigate to:
   - **Frontend**: http://localhost
   - **API**: http://localhost/api

### First-Time Setup

Docker Compose handles everything automatically on first run:
- Creates PostgreSQL database with persistent volume
- Initializes database schema from `database/init.sql`
- Creates media directories inside containers
- Sets up networking between services

**Data Persistence**: Your media files and database are stored in Docker volumes, so they persist even when containers are stopped or restarted.

## 📖 Usage Guide

### Uploading Media

1. Click the **Upload** button in the header
2. Drag and drop files or click to browse
3. Supported formats:
   - **Images**: PNG, JPG, JPEG, GIF, WEBP
   - **Videos**: MP4, WEBM, MOV, AVI, MKV
4. Click **Upload** to start the process
5. Thumbnails are generated automatically

### Organizing Media

Media is automatically organized by category:
- **Images & Videos**: General media files
- **Movies**: Movie files (place in `/media/movies/`)
- **TV Series**: TV series (place in `/media/series/`)

### Streaming Videos

1. Click on any video card
2. The video player will open with controls
3. Supports:
   - Play/Pause
   - Seek
   - Volume control
   - Fullscreen
   - Progressive streaming (no waiting for full download)

### Downloading Files

- Click the download icon on any media card
- Or click the download button in the media player

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@postgres:5432/mediaserver` |
| `JWT_SECRET` | Secret key for JWT tokens | (Must be set) |
| `MEDIA_ROOT` | Root directory for media storage | `/media` |
| `NODE_ENV` | Node environment | `production` |

### Port Configuration

To change the public port, edit `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"  # Change 8080 to your desired port
```

### Storage Configuration

Media files are stored in Docker volumes. To use a custom directory:

```yaml
volumes:
  media_storage:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/your/media
```

## 🛠️ Development

### Running Locally (Without Docker)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up PostgreSQL**

   Install PostgreSQL and create a database:

   ```sql
   CREATE DATABASE mediaserver;
   ```

3. **Update `.env` with local database URL**

   ```env
   DATABASE_URL=postgresql://localhost:5432/mediaserver
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Access at** http://localhost:3000

### Building for Production

```bash
npm run build
npm start
```

## 🐳 Docker Commands

### Start the application

```bash
docker-compose up -d
```

### Stop the application (keeps data)

```bash
docker-compose down
```

**Note**: This preserves your database and media files in Docker volumes.

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Rebuild containers (after code changes)

```bash
docker-compose up -d --build
```

### Check status

```bash
docker-compose ps
```

### Restart services (keeps data)

```bash
docker-compose restart
```

### Remove everything including data (⚠️ DESTRUCTIVE)

```bash
# This will delete all uploaded media and database
docker-compose down -v
```

## 📊 Database Schema

### Media Table

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  path TEXT NOT NULL,
  thumbnail TEXT,
  size BIGINT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category VARCHAR(50) NOT NULL
);
```

## 🔐 Authentication (Optional)

The application includes JWT-based authentication infrastructure. To enable it:

1. Uncomment the authentication check in `middleware.ts`
2. Implement login/register endpoints in `app/api/auth/`
3. Add authentication UI components

## 🚀 Performance Optimization

### Nginx Caching

Static files are cached for 1 year:
- Images
- CSS
- JavaScript
- Fonts

### Video Streaming

- Range request support for efficient streaming
- Buffering optimization
- Progressive download

### Database Indexes

Indexes are created on:
- `category` (for filtering)
- `type` (for filtering)

## 🔒 Security Considerations

1. **Change the JWT secret** in production
2. **Use HTTPS** in production (configure SSL in Nginx)
3. **Implement authentication** for uploads
4. **Set file size limits** (configured in Nginx)
5. **Regular backups** of database and media files

## 🐛 Troubleshooting

### Port already in use

If port 80 is already in use, change it in `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8080:80"
```

### Database connection issues

Check if PostgreSQL is running:

```bash
docker-compose ps postgres
```

View PostgreSQL logs:

```bash
docker-compose logs postgres
```

### Upload failures

1. Check disk space
2. Verify media directories exist
3. Check file permissions
4. Review backend logs: `docker-compose logs backend`

### Video streaming issues

1. Ensure ffmpeg is installed in the backend container
2. Check video codec compatibility
3. Verify range request support in Nginx config

## 📦 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: TailwindCSS, ShadCN/UI, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **Media Processing**: Sharp (images), FFmpeg (videos)
- **Proxy**: Nginx
- **Container**: Docker, Docker Compose

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/media` | GET | List all media |
| `/api/media/upload` | POST | Upload media file |
| `/api/media/stream/:id` | GET | Stream media file |
| `/api/media/download/:id` | GET | Download media file |
| `/api/media/thumbnail/:filename` | GET | Get thumbnail image |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment tools
- ShadCN for beautiful UI components
- The open-source community

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Check GitHub issues

---

**Enjoy your home media server! 🎉**
