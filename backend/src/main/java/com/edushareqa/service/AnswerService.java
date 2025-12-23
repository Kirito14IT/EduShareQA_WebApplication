package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.edushareqa.dto.AnswerDetail;
import com.edushareqa.entity.Answer;
import com.edushareqa.entity.AnswerAttachment;
import com.edushareqa.entity.Question;
import com.edushareqa.mapper.AnswerAttachmentMapper;
import com.edushareqa.mapper.AnswerMapper;
import com.edushareqa.mapper.QuestionMapper;
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
public class AnswerService {
    
    @Autowired
    private AnswerMapper answerMapper;
    
    @Autowired
    private AnswerAttachmentMapper attachmentMapper;
    
    @Autowired
    private QuestionMapper questionMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public AnswerDetail createAnswer(HttpServletRequest request, Long questionId,
                                    String content, List<MultipartFile> attachments) {
        String token = getTokenFromRequest(request);
        Long teacherId = jwtUtil.getUserIdFromToken(token);
        
        Question question = questionMapper.selectById(questionId);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setTeacherId(teacherId);
        answer.setContent(content);
        answer.setIsPublished(true);
        answer.setCreatedAt(LocalDateTime.now());
        answer.setUpdatedAt(LocalDateTime.now());
        
        answerMapper.insert(answer);
        
        // 保存附件
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                if (!file.isEmpty()) {
                    try {
                        String filePath = fileService.saveAnswerAttachment(file);
                        AnswerAttachment attachment = new AnswerAttachment();
                        attachment.setAnswerId(answer.getId());
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
        
        // 更新问题状态和回答数
        question.setStatus("ANSWERED");
        question.setAnswerCount(question.getAnswerCount() + 1);
        question.setUpdatedAt(LocalDateTime.now());
        questionMapper.updateById(question);
        
        // 发送通知
        notificationService.createAnswerNotification(question.getStudentId(), questionId, answer.getId());
        
        return toAnswerDetail(answer);
    }
    
    @Transactional
    public void deleteAnswer(HttpServletRequest request, Long id) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Answer answer = answerMapper.selectById(id);
        if (answer == null) {
            throw new RuntimeException("回答不存在");
        }
        
        if (!answer.getTeacherId().equals(userId)) {
            throw new RuntimeException("无权删除此回答");
        }
        
        answerMapper.deleteById(id);
    }

    @Transactional
    public void adminDeleteAnswer(Long id) {
        answerMapper.deleteById(id);
    }
    
    private AnswerDetail toAnswerDetail(Answer answer) {
        AnswerDetail detail = new AnswerDetail();
        detail.setId(answer.getId());
        detail.setQuestionId(answer.getQuestionId());
        detail.setTeacherId(answer.getTeacherId());
        detail.setContent(answer.getContent());
        detail.setCreatedAt(answer.getCreatedAt().toString());
        
        var teacher = userMapper.selectById(answer.getTeacherId());
        if (teacher != null) {
            detail.setTeacherName(teacher.getFullName());
        }
        
        // 加载附件
        LambdaQueryWrapper<AnswerAttachment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AnswerAttachment::getAnswerId, answer.getId());
        List<AnswerAttachment> attachments = attachmentMapper.selectList(wrapper);
        detail.setAttachments(attachments.stream()
                .map(a -> {
                    com.edushareqa.dto.AnswerAttachmentDTO dto = new com.edushareqa.dto.AnswerAttachmentDTO();
                    dto.setId(a.getId());
                    dto.setFilePath(a.getFilePath());
                    dto.setFileType(a.getFileType());
                    return dto;
                })
                .collect(Collectors.toList()));
        
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

