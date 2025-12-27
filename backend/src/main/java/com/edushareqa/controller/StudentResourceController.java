package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.ResourceDetail;
import com.edushareqa.entity.Resource;
import com.edushareqa.service.ResourceService;
import com.edushareqa.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/student/resources")
public class StudentResourceController {
    
    @Autowired
    private ResourceService resourceService;

    @Autowired
    private FileService fileService;
    
    @GetMapping
    public ApiResponse<PagedResponse<ResourceDetail>> getResources(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        PagedResponse<ResourceDetail> result = resourceService.getResources(
                courseId, keyword, page, pageSize, request);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ResourceDetail> getResourceById(@PathVariable Long id) {
        ResourceDetail resource = resourceService.getResourceById(id);
        return ApiResponse.success(resource);
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<FileSystemResource> downloadResource(@PathVariable Long id) {
        Resource resource = resourceService.getResourceForDownload(id);
        File file = fileService.getResourceFile(resource.getFilePath());
        
        if (file == null || !file.exists()) {
            throw new RuntimeException("文件不存在");
        }
        
        FileSystemResource fileResource = new FileSystemResource(file);
        
        String extension = "";
        if (resource.getFilePath() != null && resource.getFilePath().contains(".")) {
            extension = resource.getFilePath().substring(resource.getFilePath().lastIndexOf("."));
        }
        
        String downloadName = resource.getTitle();
        if (downloadName == null || downloadName.trim().isEmpty()) {
            downloadName = "resource_" + id;
        }
        if (!downloadName.toLowerCase().endsWith(extension.toLowerCase())) {
            downloadName += extension;
        }
        
        String encodedFilename = URLEncoder.encode(downloadName, StandardCharsets.UTF_8).replace("+", "%20");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.parseMediaType(resource.getFileType() != null ? resource.getFileType() : "application/octet-stream"))
                .contentLength(file.length())
                .body(fileResource);
    }
    
    @PostMapping
    public ApiResponse<Resource> uploadResource(
            @RequestParam("metadata") String metadata,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) {
        // 解析metadata JSON
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            com.edushareqa.dto.ResourceMetadata meta = mapper.readValue(metadata, com.edushareqa.dto.ResourceMetadata.class);
            Resource resource = resourceService.uploadResource(
                    request, meta.getTitle(), meta.getSummary(),
                    meta.getCourseId(), meta.getVisibility(), file);
            return ApiResponse.success(resource);
        } catch (Exception e) {
            throw new RuntimeException("上传失败: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResource(@PathVariable Long id, HttpServletRequest request) {
        resourceService.deleteResource(request, id);
        return ApiResponse.success(null);
    }
}

