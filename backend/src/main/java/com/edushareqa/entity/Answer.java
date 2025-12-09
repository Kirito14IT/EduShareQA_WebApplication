package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("answers")
public class Answer {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long questionId;
    private Long teacherId;
    private String content;
    private Boolean isPublished;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

