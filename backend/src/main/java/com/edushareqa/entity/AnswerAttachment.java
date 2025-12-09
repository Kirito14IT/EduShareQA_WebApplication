package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("answer_attachments")
public class AnswerAttachment {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long answerId;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private LocalDateTime createdAt;
}

