package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("resources")
public class Resource {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String title;
    private String summary;
    private Long courseId;
    private Long uploaderId;
    private String roleOfUploader; // STUDENT, TEACHER
    private String filePath;
    private String fileType;
    private Long fileSize;
    private Integer downloadCount;
    private String visibility; // COURSE_ONLY, PUBLIC
    private String status; // ACTIVE, DELETED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

