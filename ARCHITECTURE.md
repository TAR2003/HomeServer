# Architecture Documentation

## System Overview

The Home Media Server is a three-tier application with the following components:

### 1. Frontend (Presentation Layer)
- **Technology**: Vite + React 18 + TypeScript
- **Port**: 3000 (internal), 80 (via nginx)
- **Purpose**: User interface for media browsing, upload, and playback

### 2. Backend (Application Layer)
- **Technology**: Java Spring Boot 3.2
- **Port**: 8080
- **Purpose**: Business logic, file operations, API endpoints

### 3. Reverse Proxy (Gateway Layer)
- **Technology**: Nginx
- **Port**: 80 (external)
- **Purpose**: Route requests, load balancing, CORS handling

### 4. Database (Data Layer)
- **Technology**: H2 (embedded) / PostgreSQL
- **Purpose**: Metadata storage, file tracking

## Request Flow

### File Upload Flow
```
User Browser
    │
    ├─> Drag & Drop File
    │
    ▼
React Frontend
    │
    ├─> FormData Creation
    ├─> Axios POST /api/upload
    ├─> Progress Tracking
    │
    ▼
Nginx Reverse Proxy
    │
    ├─> Route to Backend
    ├─> Large File Buffering
    │
    ▼
Spring Boot Backend
    │
    ├─> MultipartFile Reception
    ├─> Category Validation
    ├─> File Storage
    ├─> Checksum Calculation
    ├─> Database Entry
    ├─> Async Thumbnail Generation
    │   │
    │   ├─> Image: Thumbnailator
    │   └─> Video: FFmpeg
    │
    ├─> WebSocket Notification
    │
    ▼
Response to Frontend
    │
    └─> Success Message + Metadata
```

### Video Streaming Flow
```
User Browser
    │
    ├─> Click Play Button
    │
    ▼
React Player
    │
    ├─> HTTP Request with Range Header
    │   Range: bytes=0-
    │
    ▼
Nginx Reverse Proxy
    │
    ├─> Forward to Backend
    │
    ▼
Spring Boot Backend
    │
    ├─> Parse Range Header
    ├─> Read File Chunk
    ├─> Calculate Content-Range
    │
    ▼
HTTP Response
    │
    ├─> Status: 206 Partial Content
    ├─> Content-Range: bytes 0-1023/5242880
    ├─> Content-Length: 1024
    │
    ▼
Video Player
    │
    ├─> Render Video Chunk
    ├─> Allow Seeking
    └─> Request More Chunks as Needed
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────┐
│                   User Browser                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Upload    │  │ Media Grid   │  │ Video Player ││
│  │  Component  │  │  Component   │  │   Component  ││
│  └─────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────┬────────────────────────────┘
                          │ HTTP/WS
                          │
┌─────────────────────────▼────────────────────────────┐
│              Nginx Reverse Proxy (Port 80)           │
│  ┌────────────────────────────────────────────────┐  │
│  │  /api/* → backend:8080                        │  │
│  │  /ws/*  → backend:8080 (WebSocket)            │  │
│  │  /*     → frontend:3000                       │  │
│  └────────────────────────────────────────────────┘  │
└────────────────┬────────────────┬────────────────────┘
                 │                │
        ┌────────▼──────┐  ┌──────▼─────────┐
        │   Frontend    │  │    Backend     │
        │   (React)     │  │ (Spring Boot)  │
        │   Port 3000   │  │   Port 8080    │
        └───────────────┘  └────────┬───────┘
                                    │
                           ┌────────▼─────────┐
                           │   File System    │
                           │ /app/media/*     │
                           │ /app/media/      │
                           │   thumbnails/    │
                           └──────────────────┘
                                    │
                           ┌────────▼─────────┐
                           │    Database      │
                           │  (H2/PostgreSQL) │
                           │ /app/data/       │
                           └──────────────────┘
```

## Database Schema

### MediaFile Entity
```sql
CREATE TABLE media_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    thumbnail_path VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    modified_at TIMESTAMP NOT NULL,
    checksum VARCHAR(64),
    INDEX idx_category (category),
    INDEX idx_file_name (file_name),
    INDEX idx_uploaded_at (uploaded_at)
);
```

## Security Architecture

### Current Implementation
- CORS enabled for cross-origin requests
- File size validation (10GB max)
- MIME type validation
- Path traversal prevention
- Checksum verification

### Production Recommendations
```
┌─────────────────────────────────────────┐
│  Security Layers                         │
├─────────────────────────────────────────┤
│ 1. SSL/TLS (HTTPS)                      │
│    - Certificate management             │
│    - Encrypted communication            │
├─────────────────────────────────────────┤
│ 2. Authentication                        │
│    - JWT tokens (infrastructure ready)  │
│    - User registration/login            │
│    - Session management                 │
├─────────────────────────────────────────┤
│ 3. Authorization                         │
│    - Role-based access control          │
│    - File ownership                     │
│    - Category permissions               │
├─────────────────────────────────────────┤
│ 4. Input Validation                      │
│    - File type checking                 │
│    - Size limits                        │
│    - SQL injection prevention           │
├─────────────────────────────────────────┤
│ 5. Rate Limiting                         │
│    - Upload throttling                  │
│    - API request limits                 │
│    - DDoS protection                    │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
```
                    Load Balancer
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     Backend-1       Backend-2       Backend-3
          │               │               │
          └───────────────┼───────────────┘
                          │
                  Shared Storage
                    (NAS/S3)
                          │
                     Database
                   (PostgreSQL)
```

### Vertical Scaling
- Increase JVM heap size
- Add more CPU cores
- Faster storage (SSD/NVMe)
- More RAM for caching

### Storage Scaling
- Network Attached Storage (NAS)
- Object Storage (AWS S3, MinIO)
- CDN for thumbnail delivery
- Database replication

## Performance Optimizations

### Backend
1. **Thumbnail Caching**
   - Cache generated thumbnails
   - Serve from memory when possible

2. **Async Processing**
   - Thumbnail generation is async
   - WebSocket notifications for completion

3. **Database Indexing**
   - Indexes on category, file_name, uploaded_at
   - Optimized queries

4. **Streaming**
   - Range request support
   - Chunked transfer encoding
   - Efficient file I/O

### Frontend
1. **Code Splitting**
   - Route-based splitting
   - Lazy loading components

2. **Image Optimization**
   - Lazy loading images
   - Thumbnail previews
   - Progressive loading

3. **Caching**
   - Browser caching
   - Service worker (future)

4. **Bundle Optimization**
   - Tree shaking
   - Minification
   - Compression (gzip/brotli)

## Monitoring & Logging

### Application Logs
- **Backend**: `/app/logs/` (configurable)
- **Frontend**: Browser console
- **Nginx**: `/var/log/nginx/`

### Health Checks
- Backend: `GET /api/health`
- Docker: Built-in health checks
- Restart policy: `unless-stopped`

### Metrics to Monitor
1. Upload success/failure rate
2. Video streaming performance
3. Thumbnail generation time
4. API response times
5. Disk usage
6. Memory usage
7. CPU utilization

## Backup Strategy

### What to Backup
1. **Media Files**: `/media/` directory
2. **Database**: H2 data files or PostgreSQL dump
3. **Configuration**: `application.yml`, `docker-compose.yml`

### Backup Script Example
```bash
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup media files
tar -czf $BACKUP_DIR/media.tar.gz ./media/

# Backup database
docker exec media-server-backend \
    java -jar /app/app.jar \
    --spring.datasource.url=jdbc:h2:file:./data/mediaserver \
    --spring.jpa.hibernate.ddl-auto=none \
    backup $BACKUP_DIR/database.sql
```

## Disaster Recovery

### Recovery Steps
1. Install Docker and Docker Compose
2. Restore media files to `./media/`
3. Restore database
4. Update configuration if needed
5. Run `docker-compose up --build`

### Testing Recovery
- Regular backup tests
- Documented procedures
- Test environment

## Future Enhancements

### Phase 1 - User Management
- User registration and login
- Role-based permissions
- User quotas

### Phase 2 - Advanced Features
- Playlists
- Favorites
- Comments and ratings
- Sharing links

### Phase 3 - Mobile Apps
- iOS native app
- Android native app
- Push notifications

### Phase 4 - AI/ML Features
- Auto-tagging
- Face recognition
- Content recommendations
- Smart search

### Phase 5 - Cloud Integration
- S3-compatible storage
- Cloud backup
- Multi-region deployment
- CDN integration
