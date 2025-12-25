package com.edushareqa.controller;

import com.edushareqa.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/uploads")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("/{type}/{year}/{month}/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String type,
            @PathVariable String year,
            @PathVariable String month,
            @PathVariable String filename) throws IOException {
        
        String relativePath = year + "/" + month + "/" + filename;
        File file = fileService.getFileByType(type, relativePath);
        
        if (file == null || !file.exists()) {
            // 记录更多信息以便调试
            throw new RuntimeException("File not found: uploads/" + type + "/" + relativePath);
        }
        
        Resource resource = new FileSystemResource(file);
        String contentType = Files.probeContentType(file.toPath());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // 增加一个兼容方法，处理没有 type 的路径（如旧数据）
    // 路径如：/uploads/2025/12/xxx.pdf
    @GetMapping("/{year}/{month}/{filename:.+}")
    public ResponseEntity<Resource> downloadFileLegacy(
            @PathVariable String year,
            @PathVariable String month,
            @PathVariable String filename) throws IOException {
        
        String relativePath = year + "/" + month + "/" + filename;
        
        // 尝试在所有可能的目录中查找文件
        File file = fileService.getFile(relativePath);
        
        if (file == null || !file.exists()) {
             // 记录更多信息以便调试
             throw new RuntimeException("Legacy file not found: uploads/" + relativePath);
        }
        
        Resource resource = new FileSystemResource(file);
        String contentType = Files.probeContentType(file.toPath());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
