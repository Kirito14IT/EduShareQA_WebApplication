package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.QuestionDetail;
import com.edushareqa.entity.Question;
import com.edushareqa.entity.QuestionAttachment;
import com.edushareqa.entity.User;
import com.edushareqa.mapper.QuestionAttachmentMapper;
import com.edushareqa.mapper.QuestionMapper;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionMapper questionMapper;
    
    @Autowired
    private QuestionAttachmentMapper attachmentMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Transactional
    public Question createQuestion(HttpServletRequest request, Long courseId,
                                  String title, String content, List<MultipartFile> attachments) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Question question = new Question();
        question.setCourseId(courseId);
        question.setStudentId(userId);
        question.setTitle(title);
        question.setContent(content);
        question.setStatus("OPEN");
        question.setAnswerCount(0);
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        
        questionMapper.insert(question);
        
        // 保存附件
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                if (!file.isEmpty()) {
                    try {
                        String filePath = fileService.saveQuestionAttachment(file);
                        QuestionAttachment attachment = new QuestionAttachment();
                        attachment.setQuestionId(question.getId());
                        attachment.setFilePath(filePath);
                        attachment.setFileType(file.getContentType());
                        attachment.setFileSize(file.getSize());
                        attachment.setCreatedAt(LocalDateTime.now());
                        attachmentMapper.insert(attachment);
                    } catch (Exception e) {
                        throw new RuntimeException("附件上传失败: " + e.getMessage());
                    }
                }
            }
        }
        
        return question;
    }
    
    public PagedResponse<Question> getQuestions(Long courseId, String status,
                                               Integer page, Integer pageSize, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Page<Question> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Question::getStudentId, userId);
        
        if (courseId != null) {
            wrapper.eq(Question::getCourseId, courseId);
        }
        if (status != null) {
            wrapper.eq(Question::getStatus, status);
        }
        
        wrapper.orderByDesc(Question::getCreatedAt);
        
        Page<Question> result = questionMapper.selectPage(pageObj, wrapper);
        return PagedResponse.of(result.getRecords(), page, pageSize, result.getTotal());
    }
    
    public QuestionDetail getQuestionById(Long id) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        QuestionDetail detail = new QuestionDetail();
        detail.setId(question.getId());
        detail.setCourseId(question.getCourseId());
        detail.setStudentId(question.getStudentId());
        detail.setTitle(question.getTitle());
        detail.setContent(question.getContent());
        detail.setStatus(question.getStatus());
        detail.setAnswerCount(question.getAnswerCount());
        detail.setCreatedAt(question.getCreatedAt().toString());
        
        User student = userMapper.selectById(question.getStudentId());
        if (student != null) {
            detail.setStudentName(student.getFullName());
        }
        
        // 加载附件
        LambdaQueryWrapper<QuestionAttachment> attachmentWrapper = new LambdaQueryWrapper<>();
        attachmentWrapper.eq(QuestionAttachment::getQuestionId, id);
        List<QuestionAttachment> attachments = attachmentMapper.selectList(attachmentWrapper);
        detail.setAttachments(attachments.stream()
                .map(a -> {
                    com.edushareqa.dto.QuestionAttachmentDTO dto = new com.edushareqa.dto.QuestionAttachmentDTO();
                    dto.setId(a.getId());
                    dto.setFilePath(a.getFilePath());
                    dto.setFileType(a.getFileType());
                    return dto;
                })
                .collect(Collectors.toList()));
        
        return detail;
    }
    
    @Transactional
    public void deleteQuestion(HttpServletRequest request, Long id) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        if (!question.getStudentId().equals(userId)) {
            throw new RuntimeException("无权删除此问题");
        }
        
        questionMapper.deleteById(id);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

