package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.NotificationCounts;
import com.edushareqa.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/unread-count")
    public ApiResponse<NotificationCounts> getUnreadCounts(HttpServletRequest request) {
        NotificationCounts counts = notificationService.getUnreadCounts(request);
        return ApiResponse.success(counts);
    }
}

