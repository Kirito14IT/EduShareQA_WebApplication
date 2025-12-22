-- 初始化数据脚本

USE `edushareqa`;

-- 插入角色数据
INSERT INTO `roles` (`code`, `name`) VALUES
('ADMIN', '管理员'),
('TEACHER', '教师'),
('STUDENT', '学生')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 创建默认管理员账号（密码：admin123）
-- BCrypt哈希值：$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ/2
INSERT INTO `users` (`username`, `email`, `password_hash`, `full_name`, `school_id`, `department`, `status`) VALUES
('admin', 'admin@edushareqa.edu.cn', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ/2', '系统管理员', 'ADMIN001', '信息中心', 'ACTIVE')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 为管理员分配角色
INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u, `roles` r
WHERE u.username = 'admin' AND r.code = 'ADMIN'
ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`);

