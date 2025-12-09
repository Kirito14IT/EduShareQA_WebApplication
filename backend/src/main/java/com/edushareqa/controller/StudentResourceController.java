package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.ResourceDetail;
import com.edushareqa.entity.Resource;
import com.edushareqa.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/student/resources")
public class StudentResourceController {
    
    @Autowired
    private ResourceService resourceService;
    
    @GetMapping
    public ApiResponse<PagedResponse<ResourceDetail>> getResources(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        PagedResponse<ResourceDetail> result = resourceService.getResources(
                courseId, keyword, page, pageSize);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ResourceDetail> getResourceById(@PathVariable Long id) {
        ResourceDetail resource = resourceService.getResourceById(id);
        return ApiResponse.success(resource);
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

