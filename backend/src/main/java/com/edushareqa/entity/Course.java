package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("courses")
public class Course {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String code;
    private String name;
    private String description;
    private String faculty;
    private Long createdBy;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

