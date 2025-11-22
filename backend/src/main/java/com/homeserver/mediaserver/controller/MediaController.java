package com.homeserver.mediaserver.controller;

import com.homeserver.mediaserver.dto.MediaFileDTO;
import com.homeserver.mediaserver.dto.UploadResponse;
import com.homeserver.mediaserver.entity.MediaFile;
import com.homeserver.mediaserver.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category) {
        try {
            UploadResponse response = mediaService.uploadFile(file, category);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UploadResponse(false, "Error uploading file: " + e.getMessage(), null));
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<MediaFileDTO>> getAllFiles(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(mediaService.getFilesByCategory(category));
        }
        return ResponseEntity.ok(mediaService.getAllFiles());
    }

    @GetMapping("/files/structure")
    public ResponseEntity<Map<String, Object>> getFileStructure() {
        return ResponseEntity.ok(mediaService.getFileStructure());
    }

    @GetMapping("/files/search")
    public ResponseEntity<List<MediaFileDTO>> searchFiles(@RequestParam String keyword) {
        return ResponseEntity.ok(mediaService.searchFiles(keyword));
    }

    @GetMapping("/download/**")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        try {
            Resource resource = mediaService.getFileAsResource(path);
            
            String contentType = Files.probeContentType(Paths.get(path));
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            log.error("Error downloading file", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stream/**")
    public ResponseEntity<byte[]> streamVideo(
            @RequestParam String path,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            MediaFile mediaFile = mediaService.getFileByPath(path);
            File file = new File(mediaFile.getFilePath());
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            long fileSize = file.length();
            String contentType = mediaFile.getMimeType();
            
            if (contentType == null) {
                contentType = "video/mp4";
            }

            // Handle range requests for video streaming
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return handleRangeRequest(file, rangeHeader, fileSize, contentType);
            }

            // Return full file if no range requested
            byte[] data = Files.readAllBytes(file.toPath());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                    .body(data);

        } catch (Exception e) {
            log.error("Error streaming video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private ResponseEntity<byte[]> handleRangeRequest(File file, String rangeHeader, 
                                                      long fileSize, String contentType) {
        try {
            // Parse range header
            String[] ranges = rangeHeader.replace("bytes=", "").split("-");
            long start = Long.parseLong(ranges[0]);
            long end = ranges.length > 1 && !ranges[1].isEmpty() 
                    ? Long.parseLong(ranges[1]) 
                    : fileSize - 1;

            // Validate range
            if (start > end || end >= fileSize) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                        .build();
            }

            long contentLength = end - start + 1;

            // Read file chunk
            try (RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r")) {
                byte[] buffer = new byte[(int) contentLength];
                randomAccessFile.seek(start);
                randomAccessFile.readFully(buffer);

                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_RANGE, 
                                String.format("bytes %d-%d/%d", start, end, fileSize))
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                        .body(buffer);
            }
        } catch (Exception e) {
            log.error("Error handling range request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/thumbnail")
    public ResponseEntity<Resource> getThumbnail(@RequestParam String path) {
        try {
            Resource resource = mediaService.getFileAsResource(path);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            log.error("Error getting thumbnail", e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long id) {
        try {
            boolean deleted = mediaService.deleteFile(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", "true", "message", "File deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error deleting file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "Error deleting file: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Home Media Server"));
    }
}
