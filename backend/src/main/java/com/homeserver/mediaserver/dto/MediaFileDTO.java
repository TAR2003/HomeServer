package com.homeserver.mediaserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileDTO {
    private Long id;
    private String fileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;
    private String thumbnailPath;
    private String category;
    private LocalDateTime uploadedAt;
    private LocalDateTime modifiedAt;
}
