package com.homeserver.mediaserver.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class ThumbnailService {

    @Value("${app.media.thumbnail-path}")
    private String thumbnailBasePath;

    @Value("${app.media.thumbnail-width}")
    private int thumbnailWidth;

    @Value("${app.media.thumbnail-height}")
    private int thumbnailHeight;

    @Value("${app.ffmpeg.path}")
    private String ffmpegPath;

    @Value("${app.ffmpeg.thumbnail-time}")
    private String thumbnailTime;

    public String generateThumbnail(String filePath, String mimeType) {
        try {
            // Create thumbnail directory if not exists
            Path thumbnailDir = Paths.get(thumbnailBasePath);
            Files.createDirectories(thumbnailDir);

            if (mimeType.startsWith("image/")) {
                return generateImageThumbnail(filePath);
            } else if (mimeType.startsWith("video/")) {
                return generateVideoThumbnail(filePath);
            }
            
            return null;
        } catch (Exception e) {
            log.error("Error generating thumbnail for: {}", filePath, e);
            return null;
        }
    }

    private String generateImageThumbnail(String filePath) throws IOException {
        File sourceFile = new File(filePath);
        String thumbnailFileName = UUID.randomUUID().toString() + ".jpg";
        Path thumbnailPath = Paths.get(thumbnailBasePath, thumbnailFileName);

        Thumbnails.of(sourceFile)
                .size(thumbnailWidth, thumbnailHeight)
                .outputFormat("jpg")
                .toFile(thumbnailPath.toFile());

        log.info("Image thumbnail generated: {}", thumbnailPath);
        return thumbnailPath.toString();
    }

    private String generateVideoThumbnail(String filePath) {
        try {
            String thumbnailFileName = UUID.randomUUID().toString() + ".jpg";
            Path thumbnailPath = Paths.get(thumbnailBasePath, thumbnailFileName);

            // Check if ffmpeg exists
            File ffmpeg = new File(ffmpegPath);
            if (!ffmpeg.exists()) {
                log.warn("FFmpeg not found at: {}. Trying system ffmpeg.", ffmpegPath);
                ffmpegPath = "ffmpeg"; // Try system PATH
            }

            // Execute ffmpeg command
            ProcessBuilder processBuilder = new ProcessBuilder(
                ffmpegPath,
                "-i", filePath,
                "-ss", thumbnailTime,
                "-vframes", "1",
                "-vf", "scale=" + thumbnailWidth + ":" + thumbnailHeight,
                thumbnailPath.toString()
            );
            
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode == 0 && Files.exists(thumbnailPath)) {
                log.info("Video thumbnail generated: {}", thumbnailPath);
                return thumbnailPath.toString();
            } else {
                log.error("FFmpeg failed with exit code: {}", exitCode);
                return null;
            }
        } catch (Exception e) {
            log.error("Error generating video thumbnail", e);
            return null;
        }
    }
}
