import mysql.connector
import bcrypt
import time

def get_connection():
    return mysql.connector.connect(
        host='118.89.81.131',
        user='clouduser',
        password='123456',
        port=3306,
        autocommit=True
    )

def setup_database():
    print("Connecting to database server...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create database if not exists
    cursor.execute("CREATE DATABASE IF NOT EXISTS edushareqa DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    print("Database 'edushareqa' ensured.")
    cursor.close()
    conn.close()
    
    # Connect to specific database
    conn = get_connection()
    conn.database = 'edushareqa'
    cursor = conn.cursor()
    
    # Read schema.sql
    print("Reading schema.sql...")
    with open(r'backend/src/main/resources/db/schema.sql', 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # Execute schema (simple split by ;)
    # Note: This is a simple splitter, might fail on complex stored procedures but good for standard schema
    statements = schema_sql.split(';')
    for stmt in statements:
        if stmt.strip():
            try:
                cursor.execute(stmt)
            except mysql.connector.Error as err:
                # Ignore table exists errors
                if err.errno != 1050: 
                    print(f"Schema Error: {err}")
    print("Schema applied.")

    # Check and insert roles
    roles = ['ADMIN', 'TEACHER', 'STUDENT']
    for role in roles:
        cursor.execute("SELECT id FROM roles WHERE code = %s", (role,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO roles (code, name) VALUES (%s, %s)", (role, role))
            print(f"Role {role} inserted.")
    
    # Password hash for 'password123'
    # Spring Security BCrypt default strength is 10
    # We can generate one using python bcrypt or use a fixed known hash
    # Fixed hash for 'password123' (BCrypt): $2a$10$x.z5.a.s.d.f.g.h.j.k.l (This is just an example, let's generate real one)
    hashed_pw = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')
    
    users = [
        {'username': 'admin01', 'role': 'ADMIN', 'email': 'admin01@test.com', 'name': 'Admin User'},
        {'username': 'teacher01', 'role': 'TEACHER', 'email': 'teacher01@test.com', 'name': 'Teacher User'},
        {'username': 'student01', 'role': 'STUDENT', 'email': 'student01@test.com', 'name': 'Student User'}
    ]
    
    for u in users:
        cursor.execute("SELECT id FROM users WHERE username = %s", (u['username'],))
        res = cursor.fetchone()
        if not res:
            cursor.execute(
                "INSERT INTO users (username, password_hash, email, full_name, created_at, updated_at) VALUES (%s, %s, %s, %s, NOW(), NOW())",
                (u['username'], hashed_pw, u['email'], u['name'])
            )
            user_id = cursor.lastrowid
            print(f"User {u['username']} created.")
            
            # Assign Role
            cursor.execute("SELECT id FROM roles WHERE code = %s", (u['role'],))
            role_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)", (user_id, role_id))
        else:
            # Update password just in case
            cursor.execute("UPDATE users SET password = %s WHERE username = %s", (hashed_pw, u['username']))
            print(f"User {u['username']} exists, password updated.")
            
    conn.close()
    print("Database setup complete.")

if __name__ == "__main__":
    setup_database()
