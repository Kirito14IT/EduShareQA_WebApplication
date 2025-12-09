package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("questions")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long courseId;
    private Long studentId;
    private String title;
    private String content;
    private String status; // OPEN, ANSWERED, CLOSED
    private Integer answerCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

