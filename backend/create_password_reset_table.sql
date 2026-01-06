-- 创建密码重置验证码表
-- 如果表已存在会被跳过
USE `edushareqa`;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `email` VARCHAR(128) NOT NULL COMMENT '邮箱地址',
    `token` VARCHAR(6) NOT NULL COMMENT '6位数字验证码',
    `expires_at` DATETIME NOT NULL COMMENT '过期时间',
    `used` TINYINT(1) DEFAULT 0 COMMENT '是否已使用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_token` (`token`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码重置验证码表';
