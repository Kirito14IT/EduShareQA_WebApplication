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
    
    @Value("${app.base-url:http://localhost:8080/api}")
    private String baseUrl;
    
    // 返回完整访问URL (Legacy support or internal use)
    private String getFileUrl(String baseDir, String relativePath) {
        String type = "";
        if (baseDir.equals(resourcesDir)) {
            type = "resources";
        } else if (baseDir.equals(questionAttachmentsDir)) {
            type = "question-attachments";
        } else if (baseDir.equals(answerAttachmentsDir)) {
            type = "answer-attachments";
        }
        
        // Return relative path for storage: type/year/month/filename
        return type + "/" + relativePath;
    }

    public String saveResourceFile(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, resourcesDir);
        // Returns resources/yyyy/MM/uuid.ext
        return "resources/" + relativePath;
    }
    
    public String saveQuestionAttachment(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, questionAttachmentsDir);
        // Returns question-attachments/yyyy/MM/uuid.ext
        return "question-attachments/" + relativePath;
    }
    
    public String saveAnswerAttachment(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, answerAttachmentsDir);
        // Returns answer-attachments/yyyy/MM/uuid.ext
        return "answer-attachments/" + relativePath;
    }
    
    private String saveFile(MultipartFile file, String baseDir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 创建目录结构：baseDir/yyyy/MM/
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String fullDir = baseDir + "/" + yearMonth;
        
        // Ensure absolute path to avoid Tomcat temp dir issues
        Path dirPath = Paths.get(fullDir).toAbsolutePath().normalize();
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
    
    public File getResourceFile(String filePath) {
        if (filePath == null) return null;
        
        // 兼容处理：如果数据库存的是完整URL，去掉域名部分
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
             // 查找 /uploads/resources/ 的位置
             String keyword = "/uploads/resources/";
             int index = filePath.indexOf(keyword);
             if (index != -1) {
                 filePath = filePath.substring(index + keyword.length());
             } else {
                 // Try searching for generic /uploads/ if specific not found
                 keyword = "/uploads/";
                 index = filePath.indexOf(keyword);
                 if (index != -1) {
                     filePath = filePath.substring(index + keyword.length());
                     // If filePath now is "resources/...", we are good.
                 }
             }
        }
        
        // Check if filePath starts with "resources/" (new format)
        if (filePath.startsWith("resources/")) {
            return new File(uploadDir, filePath);
        }

        File file = new File(resourcesDir, filePath);
        if (file.exists() && file.isFile()) {
            return file;
        }
        return null;
    }

    public File getFile(String filePath) {
        // New format check: if path starts with known type directories
        if (filePath.startsWith("resources/") || 
            filePath.startsWith("question-attachments/") || 
            filePath.startsWith("answer-attachments/")) {
            File file = new File(uploadDir, filePath);
            if (file.exists() && file.isFile()) {
                return file;
            }
        }

        // 尝试多个可能的目录 (Legacy support)
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
        if (filePath.startsWith("resources/") || 
            filePath.startsWith("question-attachments/") || 
            filePath.startsWith("answer-attachments/")) {
            File file = new File(uploadDir, filePath);
            if (file.exists()) {
                Files.delete(file.toPath());
                return;
            }
        }

        String[] baseDirs = {resourcesDir, questionAttachmentsDir, answerAttachmentsDir};
        for (String baseDir : baseDirs) {
            File file = new File(baseDir, filePath);
            if (file.exists()) {
                Files.delete(file.toPath());
                return;
            }
        }
    }

    public File getFileByType(String type, String relativePath) {
        String baseDir = null;
        if ("resources".equals(type)) {
            baseDir = resourcesDir;
        } else if ("question-attachments".equals(type)) {
            baseDir = questionAttachmentsDir;
        } else if ("answer-attachments".equals(type)) {
            baseDir = answerAttachmentsDir;
        }
        
        if (baseDir == null) return null;
        
        // 确保使用绝对路径查找文件
        // 这里的 relativePath 已经是 year/month/filename 的格式
        File file = new File(baseDir, relativePath);
        
        // 增加日志方便调试
        System.out.println("Looking for file: " + file.getAbsolutePath());
        
        // 如果文件不存在，尝试检查路径是否包含额外的目录层级
        // 有时候 baseDir 可能是 ./uploads/question-attachments，而 file path 是绝对路径或相对路径
        // 我们需要确保路径拼接正确
        if (!file.exists()) {
             // 尝试使用 absolute path 构建
             Path path = Paths.get(baseDir).toAbsolutePath().resolve(relativePath).normalize();
             file = path.toFile();
             System.out.println("Trying absolute path: " + file.getAbsolutePath());
        }

        if (file.exists() && file.isFile()) {
            return file;
        }
        return null;
    }
}

