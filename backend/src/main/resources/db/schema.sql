-- EduShareQA 数据库表结构
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `edushareqa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `edushareqa`;

-- 角色表
CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL UNIQUE COMMENT '角色代码：ADMIN, TEACHER, STUDENT',
    `name` VARCHAR(64) NOT NULL COMMENT '角色名称',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(64) NOT NULL UNIQUE COMMENT '登录名',
    `email` VARCHAR(128) NOT NULL UNIQUE COMMENT '邮箱',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希（BCrypt）',
    `full_name` VARCHAR(64) NOT NULL COMMENT '姓名',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `school_id` VARCHAR(64) DEFAULT NULL COMMENT '学号/工号',
    `department` VARCHAR(128) DEFAULT NULL COMMENT '所属学院',
    `status` ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 课程表
CREATE TABLE IF NOT EXISTS `courses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL UNIQUE COMMENT '课程编号',
    `name` VARCHAR(128) NOT NULL COMMENT '课程名称',
    `description` TEXT DEFAULT NULL COMMENT '课程介绍',
    `faculty` VARCHAR(128) NOT NULL COMMENT '开课学院',
    `created_by` BIGINT NOT NULL COMMENT '创建者（管理员ID）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_code` (`code`),
    INDEX `idx_faculty` (`faculty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 课程教师关联表
CREATE TABLE IF NOT EXISTS `course_teacher` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `course_id` BIGINT NOT NULL COMMENT '课程ID',
    `teacher_id` BIGINT NOT NULL COMMENT '教师ID',
    `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_course_teacher` (`course_id`, `teacher_id`),
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程教师关联表';

-- 资源表
CREATE TABLE IF NOT EXISTS `resources` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(128) NOT NULL COMMENT '标题',
    `summary` TEXT DEFAULT NULL COMMENT '简介/富文本',
    `course_id` BIGINT NOT NULL COMMENT '所属课程',
    `uploader_id` BIGINT NOT NULL COMMENT '上传者ID',
    `role_of_uploader` ENUM('STUDENT', 'TEACHER') NOT NULL COMMENT '上传者角色',
    `file_path` VARCHAR(255) NOT NULL COMMENT '文件路径',
    `file_type` VARCHAR(32) DEFAULT NULL COMMENT '文件类型：pdf/png/zip等',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    `download_count` INT DEFAULT 0 COMMENT '下载次数',
    `visibility` ENUM('COURSE_ONLY', 'PUBLIC') DEFAULT 'PUBLIC' COMMENT '可见范围',
    `status` ENUM('ACTIVE', 'DELETED') DEFAULT 'ACTIVE' COMMENT '状态（软删除）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_uploader_id` (`uploader_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_visibility` (`visibility`),
    FULLTEXT INDEX `ft_title_summary` (`title`, `summary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源表';

-- 问题表
CREATE TABLE IF NOT EXISTS `questions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `course_id` BIGINT NOT NULL COMMENT '课程ID',
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `title` VARCHAR(128) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容（支持富文本）',
    `status` ENUM('OPEN', 'ANSWERED', 'CLOSED') DEFAULT 'OPEN' COMMENT '状态',
    `answer_count` INT DEFAULT 0 COMMENT '回答数量',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_student_id` (`student_id`),
    INDEX `idx_status` (`status`),
    FULLTEXT INDEX `ft_title_content` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表';

-- 问题附件表
CREATE TABLE IF NOT EXISTS `question_attachments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` BIGINT NOT NULL COMMENT '问题ID',
    `file_path` VARCHAR(255) NOT NULL COMMENT '文件路径',
    `file_type` VARCHAR(32) DEFAULT NULL COMMENT '文件类型',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    INDEX `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题附件表';

-- 回答表
CREATE TABLE IF NOT EXISTS `answers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` BIGINT NOT NULL COMMENT '问题ID',
    `teacher_id` BIGINT NOT NULL COMMENT '教师ID',
    `content` TEXT NOT NULL COMMENT '回答内容',
    `is_published` TINYINT(1) DEFAULT 1 COMMENT '是否发布（预留草稿功能）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回答表';

-- 回答附件表
CREATE TABLE IF NOT EXISTS `answer_attachments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `answer_id` BIGINT NOT NULL COMMENT '回答ID',
    `file_path` VARCHAR(255) NOT NULL COMMENT '文件路径',
    `file_type` VARCHAR(32) DEFAULT NULL COMMENT '文件类型',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`answer_id`) REFERENCES `answers`(`id`) ON DELETE CASCADE,
    INDEX `idx_answer_id` (`answer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回答附件表';

-- 通知表
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `recipient_id` BIGINT NOT NULL COMMENT '接收者ID',
    `type` ENUM('QUESTION_REPLIED', 'NEW_QUESTION') NOT NULL COMMENT '通知类型',
    `payload` JSON DEFAULT NULL COMMENT '相关数据（question/resource id等）',
    `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    `read_at` DATETIME DEFAULT NULL COMMENT '已读时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_recipient_id` (`recipient_id`),
    INDEX `idx_is_read` (`is_read`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 刷新令牌表（可选，用于跟踪活跃的刷新Token）
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `token` VARCHAR(255) NOT NULL UNIQUE COMMENT '刷新令牌',
    `expires_at` DATETIME NOT NULL COMMENT '过期时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `revoked` TINYINT(1) DEFAULT 0 COMMENT '是否已撤销',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_token` (`token`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新令牌表';

