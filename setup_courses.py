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

def setup_courses():
    print("Connecting to database...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get Admin ID
    cursor.execute("SELECT id FROM users WHERE username = 'admin01'")
    res = cursor.fetchone()
    if not res:
        print("Error: admin01 user not found. Please run setup_remote_db.py first.")
        return
    admin_id = res[0]
    print(f"Found admin01 (ID: {admin_id})")
    
    courses = [
        ('CS101', '计算机导论', '计算机科学基础课程', '计算机学院'),
        ('MATH101', '高等数学', '微积分与线性代数', '数学学院'),
        ('ENG101', '大学英语', '英语读写听说', '外语学院'),
        ('PHYS101', '大学物理', '力学与电磁学', '物理学院'),
        ('ART101', '艺术鉴赏', '中外艺术史概览', '艺术学院')
    ]
    
    for code, name, desc, faculty in courses:
        # Check if exists
        cursor.execute("SELECT id FROM courses WHERE code = %s", (code,))
        if cursor.fetchone():
            print(f"Course {code} already exists.")
        else:
            cursor.execute(
                "INSERT INTO courses (code, name, description, faculty, created_by, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())",
                (code, name, desc, faculty, admin_id)
            )
            print(f"Course {code} created.")
            
    conn.close()
    print("Course setup complete.")

if __name__ == "__main__":
    setup_courses()
