package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("notifications")
public class Notification {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long recipientId;
    private String type; // QUESTION_REPLIED, NEW_QUESTION
    private String payload; // JSON字符串
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}

