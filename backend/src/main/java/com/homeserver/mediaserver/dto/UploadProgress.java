package com.homeserver.mediaserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadProgress {
    private String fileName;
    private long uploadedBytes;
    private long totalBytes;
    private int percentage;
    private String status;
}
