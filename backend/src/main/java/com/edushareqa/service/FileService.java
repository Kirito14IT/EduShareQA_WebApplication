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
    
    // 返回完整访问URL
    private String getFileUrl(String baseDir, String relativePath) {
        String type = "";
        if (baseDir.equals(resourcesDir)) {
            type = "resources";
        } else if (baseDir.equals(questionAttachmentsDir)) {
            type = "question-attachments";
        } else if (baseDir.equals(answerAttachmentsDir)) {
            type = "answer-attachments";
        }
        
        String url = baseUrl;
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        
        // 修改为返回相对路径部分，让前端去拼接完整 URL
        // 因为前端 QuestionDetailPage 里的逻辑是拼接 /uploads/{path}
        // 如果这里返回完整 URL，前端会重复拼接
        // 但是这里的 getFileUrl 是给 saveXXX 方法用的，这些方法直接返回给前端作为 filePath
        
        // 仔细看前端 QuestionDetailPage.tsx:
        // const getFileUrl = (path: string, token?: string) => { ... }
        // 里面有一段逻辑：
        // if (!path.startsWith('http://') && !path.startsWith('https://')) { ... }
        
        // 如果后端返回的是完整 URL，前端就会直接使用。
        // 但问题在于，后端保存时返回的到底是什么？
        // saveQuestionAttachment -> saveFile -> getFileUrl
        // getFileUrl 返回的是 http://localhost:8080/api/uploads/question-attachments/2025/12/xxx.pdf
        
        // 问题在于前端请求的 URL 是什么？
        // 前端请求的是 http://localhost:8080/api/uploads/question-attachments/2025/12/xxx.pdf?token=...
        // 对应后端 FileController 的 @GetMapping("/{type}/{year}/{month}/{filename:.+}")
        // 路径是 /uploads/{type}/{year}/{month}/{filename}
        
        // 报错信息是：No static resource uploads/2025/12/b3fbf3a2-447d-4a95-8ada-60c27c6c20ee.pdf.
        // 注意这里没有 {type} 部分！
        // 也就是说，前端请求的 URL 少了 type 部分。
        
        // 为什么会少 type 部分？
        // 让我们看看前端 QuestionDetailPage.tsx 是怎么处理 path 的。
        // if (path.startsWith('/uploads')) { url = `${baseUrl}${cleanPath}` }
        // 如果后端返回的 path 是 /uploads/question-attachments/2025/12/xxx.pdf
        // 那么前端请求的就是 .../api/uploads/question-attachments/... -> 正确
        
        // 如果后端返回的 path 是 question-attachments/2025/12/xxx.pdf (相对路径)
        // 那么前端逻辑：
        // } else if (path.includes('/')) {
        //    if (!path.startsWith('/')) { url = `${baseUrl}/uploads/${path}` }
        // 拼接后是 .../api/uploads/question-attachments/2025/12/xxx.pdf -> 正确
        
        // 那为什么报错是 uploads/2025/12/...? 缺了 type？
        // 只有一种可能：path 本身就是 2025/12/xxx.pdf，没有 type 前缀！
        
        // 让我们检查 saveFile 返回值。
        // saveFile 返回 yearMonth + "/" + filename (即 2025/12/xxx.pdf)
        // 然后 saveQuestionAttachment 调用 getFileUrl(questionAttachmentsDir, relativePath)
        // getFileUrl 返回 .../uploads/question-attachments/2025/12/xxx.pdf
        
        // 看起来保存逻辑是对的。
        // 但是！数据库里存的是什么？
        // QuestionAttachmentDTO.java 里的 filePath 字段。
        // QuestionService.java: 
        // String filePath = fileService.saveQuestionAttachment(file);
        // attachment.setFilePath(filePath);
        
        // 如果是以前存的数据呢？
        // 也许以前存的数据没有 type 前缀？或者存的是绝对路径？
        
        // 报错信息：No static resource uploads/2025/12/b3fbf3a2-447d-4a95-8ada-60c27c6c20ee.pdf.
        // 这看起来像是 Spring Boot 的静态资源处理器报的错，而不是我们 FileController 抛出的异常。
        // 我们的 FileController 抛出的是 "File not found: uploads/" + type + "/" + relativePath
        
        // 如果是 "No static resource"，说明请求没有匹配到 FileController 的 @GetMapping
        // FileController 的映射是 @RequestMapping("/uploads") 和 @GetMapping("/{type}/{year}/{month}/{filename:.+}")
        // 这要求路径必须是 /uploads/xxx/2025/12/xxx.pdf (4段)
        
        // 如果请求路径是 /uploads/2025/12/xxx.pdf (3段)
        // 那么它不匹配 FileController 的方法签名！
        // 于是 Spring 把它当做静态资源请求处理，然后找不到资源，报错。
        
        // 所以问题确实是：前端请求的 URL 少了 type (question-attachments) 这一段。
        
        // 为什么会少？
        // 1. 数据库里存的 filePath 只是 "2025/12/xxx.pdf" 而不是完整 URL？
        //    如果是这样，前端拼接时：${baseUrl}/uploads/${path} -> .../uploads/2025/12/xxx.pdf -> 缺 type。
        
        // 2. 数据库里存的是完整 URL，但是格式不对？
        
        // 让我们修改 saveFile 方法，让它返回包含 type 的相对路径，而不是仅返回日期+文件名。
        // 或者修改 getFileUrl，确保它生成正确的 URL。
        
        // 等等，FileController 需要 type 参数。
        // 如果我们想让前端能正确请求，我们需要确保 filePath 包含 type 信息。
        
        // 如果数据库里已经存了 "2025/12/xxx.pdf" 这种格式（旧数据），我们需要兼容吗？
        // 或者我们需要修改 saveFile 返回的 relativePath。
        
        // 让我们看看 saveFile 的返回值。
        // return yearMonth + "/" + filename; -> "2025/12/xxx.pdf"
        
        // 然后 saveQuestionAttachment 调用：
        // return getFileUrl(questionAttachmentsDir, relativePath);
        // getFileUrl 返回 full URL。
        
        // 如果数据库里存的是 Full URL，前端代码：
        // if (path.startsWith('http')) return path
        // 那么请求的就是 Full URL。
        
        // 那么为什么 Full URL 会错？
        // 检查 getFileUrl 实现：
        // return url + "/uploads/" + type + "/" + relativePath;
        // 结果是 .../uploads/question-attachments/2025/12/xxx.pdf
        // 这个 URL 包含 type。
        
        // 那为什么用户请求的 URL 是 .../uploads/2025/12/xxx.pdf ？
        // 唯一的解释是：数据库里存的 filePath 是 "2025/12/xxx.pdf" (不带 type 的相对路径)。
        // 这可能是因为之前的代码版本直接返回了 saveFile 的结果，没有调用 getFileUrl？
        // 或者某些地方调用了 saveFile 但没有加前缀。
        
        // 确实，ResourceService.java 里 uploadResource:
        // String filePath = fileService.saveResourceFile(file);
        // resource.setFilePath(filePath);
        // FileService.saveResourceFile -> calls getFileUrl -> returns full URL.
        
        // 难道是 QuestionService.java?
        // String filePath = fileService.saveQuestionAttachment(file);
        // attachment.setFilePath(filePath);
        // 也是调用的 saveQuestionAttachment -> getFileUrl -> full URL.
        
        // 那只有一种可能：数据是手动插入的，或者之前的代码逻辑不同。
        // 或者，前端代码里的 path 处理有问题。
        
        // 让我们看看前端代码。
        // const getFileUrl = (path: string, token?: string) => { ... }
        // 如果 path 是 "2025/12/xxx.pdf"
        // 走 else 分支 -> url = `${baseUrl}/uploads/${path}` -> .../uploads/2025/12/xxx.pdf
        // 果然少了 type！
        
        // 修复方案：
        // 1. 修改后端 saveFile 相关逻辑，确保即使返回相对路径，也要包含 type？
        //    不，saveFile 是通用的。
        // 2. 修改 FileController，增加一个兼容方法，处理没有 type 的请求？
        //    如果不带 type，我们怎么知道去哪个目录找文件？
        //    我们可以遍历所有目录尝试查找。
        
        // 这是一个很好的兼容方案：增加一个兜底的 Controller 方法。
        
        return url + "/uploads/" + type + "/" + relativePath;
    }

    public String saveResourceFile(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, resourcesDir);
        return getFileUrl(resourcesDir, relativePath);
    }
    
    public String saveQuestionAttachment(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, questionAttachmentsDir);
        return getFileUrl(questionAttachmentsDir, relativePath);
    }
    
    public String saveAnswerAttachment(MultipartFile file) throws IOException {
        String relativePath = saveFile(file, answerAttachmentsDir);
        return getFileUrl(answerAttachmentsDir, relativePath);
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
             }
        }
        
        File file = new File(resourcesDir, filePath);
        if (file.exists() && file.isFile()) {
            return file;
        }
        return null;
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

