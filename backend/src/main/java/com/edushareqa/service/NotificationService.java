package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.NotificationCounts;
import com.edushareqa.entity.Notification;
import com.edushareqa.mapper.NotificationMapper;
import com.edushareqa.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationMapper notificationMapper;
    
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
        
        NotificationCounts counts = new NotificationCounts();
        counts.setNewAnswers(notificationMapper.countUnreadAnswers(userId));
        counts.setPendingQuestions(notificationMapper.countUnreadQuestions(userId));
        
        return counts;
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

