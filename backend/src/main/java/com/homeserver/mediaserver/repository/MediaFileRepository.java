package com.homeserver.mediaserver.repository;

import com.homeserver.mediaserver.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    
    Optional<MediaFile> findByFilePath(String filePath);
    
    List<MediaFile> findByCategory(String category);
    
    @Query("SELECT m FROM MediaFile m WHERE m.category = :category ORDER BY m.uploadedAt DESC")
    List<MediaFile> findByCategoryOrderByUploadedAtDesc(@Param("category") String category);
    
    @Query("SELECT m FROM MediaFile m WHERE LOWER(m.fileName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MediaFile> searchByFileName(@Param("keyword") String keyword);
    
    Optional<MediaFile> findByChecksum(String checksum);
    
    @Query("SELECT m FROM MediaFile m ORDER BY m.uploadedAt DESC")
    List<MediaFile> findAllOrderByUploadedAtDesc();
}
