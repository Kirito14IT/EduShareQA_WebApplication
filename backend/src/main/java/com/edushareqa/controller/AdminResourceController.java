package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.ResourceDetail;
import com.edushareqa.dto.ResourceMetadata;
import com.edushareqa.entity.Resource;
import com.edushareqa.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

@RestController
@RequestMapping("/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceController {

    @Autowired
    private ResourceService resourceService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ApiResponse<PagedResponse<ResourceDetail>> getAllResources(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<ResourceDetail> result = resourceService.getAllResources(keyword, page, pageSize);
        return ApiResponse.success(result);
    }

    @PutMapping("/{id}")
    public ApiResponse<Resource> updateResource(
            @PathVariable Long id, 
            @RequestParam("metadata") String metadataJson,
            @RequestParam(value = "file", required = false) MultipartFile file) throws JsonProcessingException {
        ResourceMetadata metadata = objectMapper.readValue(metadataJson, ResourceMetadata.class);
        Resource resource = resourceService.adminUpdateResource(id, metadata, file);
        return ApiResponse.success(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResource(@PathVariable Long id) {
        resourceService.adminDeleteResource(id);
        return ApiResponse.success(null);
    }
}
