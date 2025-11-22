package com.homeserver.mediaserver.service;

import com.homeserver.mediaserver.dto.MediaFileDTO;
import com.homeserver.mediaserver.dto.UploadResponse;
import com.homeserver.mediaserver.entity.MediaFile;
import com.homeserver.mediaserver.repository.MediaFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaFileRepository mediaFileRepository;
    private final ThumbnailService thumbnailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.media.base-path}")
    private String mediaBasePath;

    @Value("${app.media.folders}")
    private List<String> mediaFolders;

    public UploadResponse uploadFile(MultipartFile file, String category) throws IOException {
        log.info("Uploading file: {} to category: {}", file.getOriginalFilename(), category);

        // Validate category
        if (!mediaFolders.contains(category)) {
            return new UploadResponse(false, "Invalid category", null);
        }

        // Create directory if not exists
        Path categoryPath = Paths.get(mediaBasePath, category);
        Files.createDirectories(categoryPath);

        // Save file
        String fileName = file.getOriginalFilename();
        Path filePath = categoryPath.resolve(fileName);
        
        // Handle duplicate filenames
        int counter = 1;
        while (Files.exists(filePath)) {
            String nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            String extension = fileName.substring(fileName.lastIndexOf('.'));
            fileName = nameWithoutExt + "_" + counter + extension;
            filePath = categoryPath.resolve(fileName);
            counter++;
        }

        file.transferTo(filePath.toFile());

        // Calculate checksum
        String checksum = calculateChecksum(filePath.toFile());

        // Create media file entity
        MediaFile mediaFile = new MediaFile();
        mediaFile.setFileName(fileName);
        mediaFile.setFilePath(filePath.toString());
        mediaFile.setMimeType(file.getContentType());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setCategory(category);
        mediaFile.setChecksum(checksum);

        // Generate thumbnail asynchronously
        generateThumbnailAsync(mediaFile);

        // Save to database
        mediaFile = mediaFileRepository.save(mediaFile);

        log.info("File uploaded successfully: {}", fileName);
        
        return new UploadResponse(true, "File uploaded successfully", convertToDTO(mediaFile));
    }

    @Async
    protected void generateThumbnailAsync(MediaFile mediaFile) {
        try {
            String thumbnailPath = thumbnailService.generateThumbnail(
                mediaFile.getFilePath(), 
                mediaFile.getMimeType()
            );
            if (thumbnailPath != null) {
                mediaFile.setThumbnailPath(thumbnailPath);
                mediaFileRepository.save(mediaFile);
                
                // Notify clients via WebSocket
                messagingTemplate.convertAndSend("/topic/thumbnail", 
                    Map.of("fileId", mediaFile.getId(), "thumbnailPath", thumbnailPath));
            }
        } catch (Exception e) {
            log.error("Error generating thumbnail for file: {}", mediaFile.getFileName(), e);
        }
    }

    public List<MediaFileDTO> getAllFiles() {
        return mediaFileRepository.findAllOrderByUploadedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MediaFileDTO> getFilesByCategory(String category) {
        return mediaFileRepository.findByCategoryOrderByUploadedAtDesc(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MediaFileDTO> searchFiles(String keyword) {
        return mediaFileRepository.searchByFileName(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Resource getFileAsResource(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        Resource resource = new UrlResource(path.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("File not found: " + filePath);
        }
    }

    public MediaFile getFileByPath(String filePath) {
        return mediaFileRepository.findByFilePath(filePath)
                .orElseThrow(() -> new RuntimeException("File not found: " + filePath));
    }

    public Map<String, Object> getFileStructure() {
        Map<String, Object> structure = new HashMap<>();
        
        for (String folder : mediaFolders) {
            List<MediaFileDTO> files = getFilesByCategory(folder);
            structure.put(folder, files);
        }
        
        return structure;
    }

    private MediaFileDTO convertToDTO(MediaFile mediaFile) {
        MediaFileDTO dto = new MediaFileDTO();
        dto.setId(mediaFile.getId());
        dto.setFileName(mediaFile.getFileName());
        dto.setFilePath(mediaFile.getFilePath());
        dto.setMimeType(mediaFile.getMimeType());
        dto.setFileSize(mediaFile.getFileSize());
        dto.setThumbnailPath(mediaFile.getThumbnailPath());
        dto.setCategory(mediaFile.getCategory());
        dto.setUploadedAt(mediaFile.getUploadedAt());
        dto.setModifiedAt(mediaFile.getModifiedAt());
        return dto;
    }

    private String calculateChecksum(File file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] fileBytes = FileUtils.readFileToByteArray(file);
            byte[] hashBytes = digest.digest(fileBytes);
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Error calculating checksum", e);
            return null;
        }
    }

    public boolean deleteFile(Long id) {
        try {
            Optional<MediaFile> mediaFileOpt = mediaFileRepository.findById(id);
            if (mediaFileOpt.isEmpty()) {
                return false;
            }
            
            MediaFile mediaFile = mediaFileOpt.get();
            
            // Delete physical file
            Path filePath = Paths.get(mediaFile.getFilePath());
            Files.deleteIfExists(filePath);
            
            // Delete thumbnail if exists
            if (mediaFile.getThumbnailPath() != null) {
                Path thumbnailPath = Paths.get(mediaFile.getThumbnailPath());
                Files.deleteIfExists(thumbnailPath);
            }
            
            // Delete from database
            mediaFileRepository.deleteById(id);
            
            log.info("Deleted file: {} (ID: {})", mediaFile.getFileName(), id);
            return true;
        } catch (Exception e) {
            log.error("Error deleting file with ID: {}", id, e);
            return false;
        }
    }
}
