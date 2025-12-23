package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    private String email;
    private String passwordHash;
    private String fullName;
    private String avatarUrl;
    private String schoolId;
    private String department;
    private String title;
    private String bio;
    private String status; // ACTIVE, DISABLED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

