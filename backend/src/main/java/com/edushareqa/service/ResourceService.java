package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.ResourceDetail;
import com.edushareqa.entity.Resource;
import com.edushareqa.entity.User;
import com.edushareqa.mapper.ResourceMapper;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {
    
    @Autowired
    private ResourceMapper resourceMapper;
    
    @Autowired
    private com.edushareqa.mapper.CourseMapper courseMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Transactional
    public Resource uploadResource(HttpServletRequest request, String title, String summary,
                                   Long courseId, String visibility, MultipartFile file) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        List<String> roles = jwtUtil.getRolesFromToken(token);
        
        // 检查课程是否存在
        if (courseMapper.selectById(courseId) == null) {
            throw new RuntimeException("课程不存在: " + courseId);
        }

        String roleOfUploader = roles.contains("TEACHER") ? "TEACHER" : "STUDENT";
        
        String filePath = null;
        String fileType = null;
        Long fileSize = 0L;
        
        if (file != null && !file.isEmpty()) {
            try {
                filePath = fileService.saveResourceFile(file);
                fileType = file.getContentType();
                fileSize = file.getSize();
            } catch (Exception e) {
                throw new RuntimeException("文件上传失败: " + e.getMessage());
            }
        }
        
        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setSummary(summary);
        resource.setCourseId(courseId);
        resource.setUploaderId(userId);
        resource.setRoleOfUploader(roleOfUploader);
        resource.setFilePath(filePath);
        resource.setFileType(fileType);
        resource.setFileSize(fileSize);
        resource.setDownloadCount(0);
        resource.setVisibility(visibility != null ? visibility : "PUBLIC");
        resource.setStatus("ACTIVE");
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        
        resourceMapper.insert(resource);
        return resource;
    }

    public PagedResponse<ResourceDetail> getAllResources(String keyword, Integer page, Integer pageSize) {
        Page<Resource> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Resource> wrapper = new LambdaQueryWrapper<>();
        
        // Admin sees all resources, maybe filter out DELETED if needed, or show all
        wrapper.ne(Resource::getStatus, "DELETED");
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(Resource::getTitle, keyword)
                    .or().like(Resource::getSummary, keyword));
        }
        
        wrapper.orderByDesc(Resource::getCreatedAt);
        
        Page<Resource> result = resourceMapper.selectPage(pageObj, wrapper);
        
        List<ResourceDetail> items = result.getRecords().stream()
                .map(this::toResourceDetail)
                .collect(Collectors.toList());
        
        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }
    
    public PagedResponse<ResourceDetail> getResources(Long courseId, String keyword,
                                                      Integer page, Integer pageSize) {
        Page<Resource> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Resource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Resource::getStatus, "ACTIVE");
        
        if (courseId != null) {
            wrapper.eq(Resource::getCourseId, courseId);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(Resource::getTitle, keyword)
                    .or().like(Resource::getSummary, keyword));
        }
        
        wrapper.orderByDesc(Resource::getCreatedAt);
        
        Page<Resource> result = resourceMapper.selectPage(pageObj, wrapper);
        
        List<ResourceDetail> items = result.getRecords().stream()
                .map(this::toResourceDetail)
                .collect(Collectors.toList());
        
        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }
    
    public ResourceDetail getResourceById(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || !"ACTIVE".equals(resource.getStatus())) {
            throw new RuntimeException("资源不存在");
        }
        return toResourceDetail(resource);
    }
    
    public Resource getResourceForDownload(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null || !"ACTIVE".equals(resource.getStatus())) {
            throw new RuntimeException("资源不存在");
        }
        
        resource.setDownloadCount(resource.getDownloadCount() + 1);
        resourceMapper.updateById(resource);
        return resource;
    }

    @Transactional
    public void deleteResource(HttpServletRequest request, Long id) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Resource resource = resourceMapper.selectById(id);
        if (resource == null) {
            throw new RuntimeException("资源不存在");
        }
        
        // 检查权限：只能删除自己的资源
        if (!resource.getUploaderId().equals(userId)) {
            throw new RuntimeException("无权删除此资源");
        }
        
        resource.setStatus("DELETED");
        resource.setUpdatedAt(LocalDateTime.now());
        resourceMapper.updateById(resource);
    }

    @Transactional
    public void adminDeleteResource(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null) {
            throw new RuntimeException("资源不存在");
        }
        resource.setStatus("DELETED");
        resource.setUpdatedAt(LocalDateTime.now());
        resourceMapper.updateById(resource);
    }
    
    @Transactional
    public Resource adminUpdateResource(Long id, com.edushareqa.dto.ResourceMetadata metadata) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null) {
            throw new RuntimeException("资源不存在");
        }
        
        if (metadata.getTitle() != null) resource.setTitle(metadata.getTitle());
        if (metadata.getSummary() != null) resource.setSummary(metadata.getSummary());
        if (metadata.getVisibility() != null) resource.setVisibility(metadata.getVisibility());
        
        resource.setUpdatedAt(LocalDateTime.now());
        resourceMapper.updateById(resource);
        return resource;
    }
    
    private ResourceDetail toResourceDetail(Resource resource) {
        ResourceDetail detail = new ResourceDetail();
        detail.setId(resource.getId());
        detail.setTitle(resource.getTitle());
        detail.setSummary(resource.getSummary());
        detail.setCourseId(resource.getCourseId());
        detail.setUploaderId(resource.getUploaderId());
        detail.setDownloadCount(resource.getDownloadCount());
        detail.setFileType(resource.getFileType());
        detail.setFileSize(resource.getFileSize());
        detail.setVisibility(resource.getVisibility());
        detail.setCreatedAt(resource.getCreatedAt().toString());
        // Set relative URL, frontend should prepend API base URL
        detail.setFileUrl("/student/resources/" + resource.getId() + "/download");
        
        User uploader = userMapper.selectById(resource.getUploaderId());
        if (uploader != null) {
            detail.setUploaderName(uploader.getFullName());
        }
        
        return detail;
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

