# API Documentation

## Base URL
```
http://localhost/api
```

## Authentication
Currently, the API is open. JWT infrastructure is ready for future authentication implementation.

---

## Endpoints

### 1. Health Check

#### GET `/api/health`
Check if the service is running.

**Response**
```json
{
  "status": "UP",
  "service": "Home Media Server"
}
```

---

### 2. Upload File

#### POST `/api/upload`
Upload a media file to the server.

**Request**
- Content-Type: `multipart/form-data`
- Form fields:
  - `file`: The file to upload (required)
  - `category`: Category name (required)
    - Valid values: `images-videos`, `movies`, `series`

**Example (curl)**
```bash
curl -X POST http://localhost/api/upload \
  -F "file=@/path/to/video.mp4" \
  -F "category=movies"
```

**Response** (200 OK)
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "fileName": "video.mp4",
    "filePath": "/app/media/movies/video.mp4",
    "mimeType": "video/mp4",
    "fileSize": 52428800,
    "thumbnailPath": null,
    "category": "movies",
    "uploadedAt": "2024-11-22T10:30:00",
    "modifiedAt": "2024-11-22T10:30:00"
  }
}
```

**Error Response** (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid category",
  "file": null
}
```

---

### 3. Get All Files

#### GET `/api/files`
Retrieve all media files.

**Query Parameters**
- `category` (optional): Filter by category

**Example**
```bash
# Get all files
curl http://localhost/api/files

# Get files in a specific category
curl http://localhost/api/files?category=movies
```

**Response** (200 OK)
```json
[
  {
    "id": 1,
    "fileName": "video.mp4",
    "filePath": "/app/media/movies/video.mp4",
    "mimeType": "video/mp4",
    "fileSize": 52428800,
    "thumbnailPath": "/app/media/thumbnails/abc123.jpg",
    "category": "movies",
    "uploadedAt": "2024-11-22T10:30:00",
    "modifiedAt": "2024-11-22T10:30:00"
  },
  {
    "id": 2,
    "fileName": "photo.jpg",
    "filePath": "/app/media/images-videos/photo.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 2048000,
    "thumbnailPath": "/app/media/thumbnails/def456.jpg",
    "category": "images-videos",
    "uploadedAt": "2024-11-22T11:00:00",
    "modifiedAt": "2024-11-22T11:00:00"
  }
]
```

---

### 4. Get File Structure

#### GET `/api/files/structure`
Get files organized by category.

**Example**
```bash
curl http://localhost/api/files/structure
```

**Response** (200 OK)
```json
{
  "images-videos": [
    {
      "id": 2,
      "fileName": "photo.jpg",
      "filePath": "/app/media/images-videos/photo.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 2048000,
      "thumbnailPath": "/app/media/thumbnails/def456.jpg",
      "category": "images-videos",
      "uploadedAt": "2024-11-22T11:00:00",
      "modifiedAt": "2024-11-22T11:00:00"
    }
  ],
  "movies": [
    {
      "id": 1,
      "fileName": "video.mp4",
      "filePath": "/app/media/movies/video.mp4",
      "mimeType": "video/mp4",
      "fileSize": 52428800,
      "thumbnailPath": "/app/media/thumbnails/abc123.jpg",
      "category": "movies",
      "uploadedAt": "2024-11-22T10:30:00",
      "modifiedAt": "2024-11-22T10:30:00"
    }
  ],
  "series": []
}
```

---

### 5. Search Files

#### GET `/api/files/search`
Search files by filename.

**Query Parameters**
- `keyword` (required): Search term

**Example**
```bash
curl "http://localhost/api/files/search?keyword=vacation"
```

**Response** (200 OK)
```json
[
  {
    "id": 5,
    "fileName": "vacation-2024.mp4",
    "filePath": "/app/media/images-videos/vacation-2024.mp4",
    "mimeType": "video/mp4",
    "fileSize": 10240000,
    "thumbnailPath": "/app/media/thumbnails/xyz789.jpg",
    "category": "images-videos",
    "uploadedAt": "2024-11-22T14:00:00",
    "modifiedAt": "2024-11-22T14:00:00"
  }
]
```

---

### 6. Download File

#### GET `/api/download`
Download a media file.

**Query Parameters**
- `path` (required): Full file path

**Example**
```bash
curl "http://localhost/api/download?path=/app/media/movies/video.mp4" \
  --output video.mp4
```

**Response**
- Content-Type: Appropriate MIME type
- Content-Disposition: `attachment; filename="video.mp4"`
- Body: File binary data

**Error Response** (404 Not Found)
```
File not found
```

---

### 7. Stream Video

#### GET `/api/stream`
Stream video with support for range requests (seekable video).

**Query Parameters**
- `path` (required): Full file path

**Headers**
- `Range` (optional): Byte range to request
  - Format: `bytes=0-1023` or `bytes=0-`

**Example**
```bash
# Full video
curl "http://localhost/api/stream?path=/app/media/movies/video.mp4"

# Range request (first 1MB)
curl "http://localhost/api/stream?path=/app/media/movies/video.mp4" \
  -H "Range: bytes=0-1048575"
```

**Response** (200 OK - Full file)
- Content-Type: `video/mp4`
- Accept-Ranges: `bytes`
- Content-Length: File size
- Body: Full file

**Response** (206 Partial Content - Range request)
- Content-Type: `video/mp4`
- Accept-Ranges: `bytes`
- Content-Range: `bytes 0-1048575/52428800`
- Content-Length: `1048576`
- Body: Requested byte range

**Error Response** (416 Range Not Satisfiable)
```
Invalid range
```

---

### 8. Get Thumbnail

#### GET `/api/thumbnail`
Retrieve a thumbnail image.

**Query Parameters**
- `path` (required): Thumbnail file path

**Example**
```bash
curl "http://localhost/api/thumbnail?path=/app/media/thumbnails/abc123.jpg" \
  --output thumbnail.jpg
```

**Response** (200 OK)
- Content-Type: `image/jpeg`
- Body: Thumbnail binary data

**Error Response** (404 Not Found)
```
Thumbnail not found
```

---

## WebSocket Events

### Connection
```
ws://localhost/ws
```

### Subscribe to Thumbnail Updates
```javascript
const client = new StompClient({
  brokerURL: 'ws://localhost/ws',
  onConnect: () => {
    client.subscribe('/topic/thumbnail', (message) => {
      const data = JSON.parse(message.body);
      console.log('Thumbnail generated:', data);
      // { fileId: 1, thumbnailPath: "/app/media/thumbnails/abc123.jpg" }
    });
  }
});
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 206 | Partial Content (range request) |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (file doesn't exist) |
| 416 | Range Not Satisfiable |
| 500 | Internal Server Error |

---

## Rate Limiting
Currently no rate limiting is implemented. For production, consider:
- 100 requests per minute per IP
- 10 concurrent uploads per user
- 1GB total upload per hour per user

---

## CORS
CORS is enabled for all origins (`*`). For production:
```yaml
cors:
  allowed-origins: "https://yourdomain.com"
  allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
  allowed-headers: "*"
  allow-credentials: true
```

---

## Example Workflows

### Complete Upload Workflow
```javascript
// 1. Upload file
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'movies');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  onUploadProgress: (progress) => {
    console.log(`Upload: ${progress.loaded}/${progress.total}`);
  }
});

const result = await response.json();
console.log('Uploaded:', result.file);

// 2. Wait for thumbnail (via WebSocket)
// Thumbnail notification will arrive via /topic/thumbnail

// 3. Display file in grid
const allFiles = await fetch('/api/files').then(r => r.json());
```

### Video Playback Workflow
```javascript
// 1. Get video URL
const videoPath = '/app/media/movies/video.mp4';
const streamUrl = `/api/stream?path=${encodeURIComponent(videoPath)}`;

// 2. Use with HTML5 video or React Player
<video controls>
  <source src={streamUrl} type="video/mp4" />
</video>

// 3. Browser automatically handles range requests for seeking
```

### Search Workflow
```javascript
// 1. User types search query
const keyword = 'vacation';

// 2. Search files
const results = await fetch(
  `/api/files/search?keyword=${encodeURIComponent(keyword)}`
).then(r => r.json());

// 3. Display results
console.log(`Found ${results.length} files`);
```

---

## Testing with Postman

### Import Collection
Create a Postman collection with these endpoints:

1. **Health Check**
   - GET `http://localhost/api/health`

2. **Upload File**
   - POST `http://localhost/api/upload`
   - Body: form-data
   - Add `file` and `category` fields

3. **Get All Files**
   - GET `http://localhost/api/files`

4. **Search Files**
   - GET `http://localhost/api/files/search?keyword=test`

5. **Stream Video**
   - GET `http://localhost/api/stream?path=/app/media/movies/video.mp4`
   - Headers: `Range: bytes=0-1048575`

---

## JavaScript/TypeScript Client Example

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost/api';

// Upload with progress
async function uploadFile(file: File, category: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentage = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total!
      );
      console.log(`Upload: ${percentage}%`);
    }
  });

  return response.data;
}

// Get all files
async function getAllFiles() {
  const response = await axios.get(`${API_BASE}/files`);
  return response.data;
}

// Search files
async function searchFiles(keyword: string) {
  const response = await axios.get(`${API_BASE}/files/search`, {
    params: { keyword }
  });
  return response.data;
}

// Get stream URL
function getStreamUrl(filePath: string) {
  return `${API_BASE}/stream?path=${encodeURIComponent(filePath)}`;
}
```

---

## Python Client Example

```python
import requests

API_BASE = 'http://localhost/api'

# Upload file
def upload_file(file_path, category):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'category': category}
        response = requests.post(f'{API_BASE}/upload', files=files, data=data)
        return response.json()

# Get all files
def get_all_files():
    response = requests.get(f'{API_BASE}/files')
    return response.json()

# Search files
def search_files(keyword):
    response = requests.get(f'{API_BASE}/files/search', params={'keyword': keyword})
    return response.json()

# Download file
def download_file(file_path, output_path):
    response = requests.get(f'{API_BASE}/download', params={'path': file_path})
    with open(output_path, 'wb') as f:
        f.write(response.content)
```

---

## Support & Issues

For issues, questions, or feature requests, please refer to the main README.md or create an issue in the repository.
