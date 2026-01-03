package com.edushareqa.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDetail {
    private Long id;
    private String type;
    private String message;
    private Long questionId;
    private Long answerId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
