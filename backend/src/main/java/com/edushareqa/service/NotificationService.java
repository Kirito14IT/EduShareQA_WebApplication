package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.NotificationCounts;
import com.edushareqa.dto.NotificationDetail;
import com.edushareqa.entity.Notification;
import com.edushareqa.mapper.NotificationMapper;
import com.edushareqa.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationMapper notificationMapper;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private JwtUtil jwtUtil;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Transactional
    public void createAnswerNotification(Long studentId, Long questionId, Long answerId) {
        Notification notification = new Notification();
        notification.setRecipientId(studentId);
        notification.setType("QUESTION_REPLIED");
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("questionId", questionId);
        payload.put("answerId", answerId);
        
        try {
            notification.setPayload(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            throw new RuntimeException("创建通知失败", e);
        }
        
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insert(notification);
    }
    
    public NotificationCounts getUnreadCounts(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        java.util.List<String> roles = jwtUtil.getRolesFromToken(token);

        NotificationCounts counts = new NotificationCounts();
        counts.setNewAnswers(notificationMapper.countUnreadAnswers(userId));

        // 根据用户角色获取不同的pendingQuestions
        if (roles.contains("TEACHER")) {
            // 教师：统计待回答的问题数量（所教课程的未回答问题）
            counts.setPendingQuestions(questionService.countPendingQuestions(userId));
        } else {
            // 学生：统计未读的"NEW_QUESTION"通知数量（如果需要的话）
            counts.setPendingQuestions(notificationMapper.countUnreadQuestions(userId));
        }

        return counts;
    }

    @Transactional
    public void markAllAsRead(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);

        notificationMapper.markAllAsRead(userId, LocalDateTime.now());
    }

    public java.util.List<NotificationDetail> getNotifications(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);

        var notifications = notificationMapper.selectList(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, userId)
                .orderByDesc(Notification::getCreatedAt)
        );

        return notifications.stream().map(this::convertToDetail).toList();
    }

    private NotificationDetail convertToDetail(Notification notification) {
        NotificationDetail detail = new NotificationDetail();
        detail.setId(notification.getId());
        detail.setType(notification.getType());
        detail.setIsRead(notification.getIsRead());
        detail.setCreatedAt(notification.getCreatedAt());

        try {
            JsonNode payload = objectMapper.readTree(notification.getPayload());
            if ("QUESTION_REPLIED".equals(notification.getType())) {
                detail.setQuestionId(payload.get("questionId").asLong());
                detail.setAnswerId(payload.get("answerId").asLong());
                detail.setMessage("您的提问收到了新的回答");
            } else if ("NEW_QUESTION".equals(notification.getType())) {
                detail.setQuestionId(payload.get("questionId").asLong());
                detail.setMessage("您有一个新的提问待处理");
            }
        } catch (Exception e) {
            detail.setMessage("通知内容解析失败");
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

