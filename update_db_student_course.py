import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host='118.89.81.131',
        user='clouduser',
        password='123456',
        database='edushareqa',
        port=3306,
        autocommit=True
    )

def update_schema():
    print("Connecting to database...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create course_student table
    sql = """
    CREATE TABLE IF NOT EXISTS `course_student` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `course_id` BIGINT NOT NULL COMMENT '课程ID',
        `student_id` BIGINT NOT NULL COMMENT '学生ID',
        `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
        FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `uk_course_student` (`course_id`, `student_id`),
        INDEX `idx_course_id` (`course_id`),
        INDEX `idx_student_id` (`student_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程学生关联表';
    """
    
    try:
        print("Creating course_student table...")
        cursor.execute(sql)
        print("Table created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    
    # Assign existing student01 to all courses initially (or maybe just one for testing?)
    # Requirement says "Admin assigns". But for testing visibility, we might want to start fresh.
    # Let's leave it empty so we can test "Student sees nothing" first, then assign.
    
    conn.close()
    print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
