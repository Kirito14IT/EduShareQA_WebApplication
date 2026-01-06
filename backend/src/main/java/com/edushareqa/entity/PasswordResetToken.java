package com.edushareqa.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("password_reset_tokens")
public class PasswordResetToken {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;
    private String email;
    private String token;
    private LocalDateTime expiresAt;
    private Boolean used;

    private LocalDateTime createdAt;
}
