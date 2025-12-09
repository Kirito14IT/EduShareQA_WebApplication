package com.edushareqa.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileService {
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    @Value("${file.resources-dir:./uploads/resources}")
    private String resourcesDir;
    
    @Value("${file.question-attachments-dir:./uploads/question-attachments}")
    private String questionAttachmentsDir;
    
    @Value("${file.answer-attachments-dir:./uploads/answer-attachments}")
    private String answerAttachmentsDir;
    
    public String saveResourceFile(MultipartFile file) throws IOException {
        return saveFile(file, resourcesDir);
    }
    
    public String saveQuestionAttachment(MultipartFile file) throws IOException {
        return saveFile(file, questionAttachmentsDir);
    }
    
    public String saveAnswerAttachment(MultipartFile file) throws IOException {
        return saveFile(file, answerAttachmentsDir);
    }
    
    private String saveFile(MultipartFile file, String baseDir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 创建目录结构：baseDir/yyyy/MM/
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fullDir = baseDir + "/" + yearMonth;
        
        Path dirPath = Paths.get(fullDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // 保存文件
        Path filePath = dirPath.resolve(filename);
        file.transferTo(filePath.toFile());
        
        // 返回相对路径
        return yearMonth + "/" + filename;
    }
    
    public File getFile(String filePath) {
        // 尝试多个可能的目录
        String[] baseDirs = {resourcesDir, questionAttachmentsDir, answerAttachmentsDir};
        for (String baseDir : baseDirs) {
            File file = new File(baseDir, filePath);
            if (file.exists() && file.isFile()) {
                return file;
            }
        }
        return null;
    }
    
    public void deleteFile(String filePath) throws IOException {
        String[] baseDirs = {resourcesDir, questionAttachmentsDir, answerAttachmentsDir};
        for (String baseDir : baseDirs) {
            File file = new File(baseDir, filePath);
            if (file.exists()) {
                Files.delete(file.toPath());
                return;
            }
        }
    }
}

