#!/usr/bin/env python3
import mysql.connector
from datetime import datetime

def insert_test_data():
    try:
        # 连接数据库
        conn = mysql.connector.connect(
            host='118.89.81.131',
            user='clouduser',
            password='123456',
            database='edushareqa',
            port=3306,
            autocommit=True
        )
        cursor = conn.cursor()

        print("正在检查现有数据...")

        # 检查是否有教师账号
        cursor.execute("SELECT id, username FROM users WHERE username = 'teacher01'")
        teacher = cursor.fetchone()
        if teacher:
            teacher_id = teacher[0]
            print(f"找到教师: {teacher[1]} (ID: {teacher_id})")
        else:
            print("未找到教师账号，正在创建...")
            # 插入教师账号
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, full_name, department, title, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, ('teacher01', 'teacher01@campus.edu', '$2a$10$8AvSLrO1wDmDx7K0k6OUp.CFYIyIelq/XWmdOY54FkY4zwkETLOaO', '张老师', '计算机学院', '教授', 'ACTIVE'))
            teacher_id = cursor.lastrowid
            print(f"创建教师账号，ID: {teacher_id}")

            # 分配教师角色
            cursor.execute("SELECT id FROM roles WHERE code = 'TEACHER'")
            role_result = cursor.fetchone()
            if role_result:
                cursor.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)", (teacher_id, role_result[0]))

        # 检查是否有课程
        cursor.execute("SELECT id, code FROM courses WHERE code = 'CS101'")
        course = cursor.fetchone()
        if course:
            course_id = course[0]
            print(f"找到课程: {course[1]} (ID: {course_id})")
        else:
            print("未找到课程，正在创建...")
            # 插入课程
            cursor.execute("""
                INSERT INTO courses (code, name, description, faculty, created_by, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """, ('CS101', '计算机导论', '计算机科学基础课程', '计算机学院', 1))
            course_id = cursor.lastrowid
            print(f"创建课程，ID: {course_id}")

            # 分配教师到课程
            cursor.execute("INSERT INTO course_teachers (course_id, teacher_id) VALUES (%s, %s)", (course_id, teacher_id))

        # 检查是否有学生账号
        cursor.execute("SELECT id, username FROM users WHERE username = 'student01'")
        student = cursor.fetchone()
        if student:
            student_id = student[0]
            print(f"找到学生: {student[1]} (ID: {student_id})")
        else:
            print("未找到学生账号，正在创建...")
            # 插入学生账号
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, full_name, department, school_id, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, ('student01', 'student01@campus.edu', '$2a$10$8AvSLrO1wDmDx7K0k6OUp.CFYIyIelq/XWmdOY54FkY4zwkETLOaO', '李同学', '计算机学院', '2021001', 'ACTIVE'))
            student_id = cursor.lastrowid
            print(f"创建学生账号，ID: {student_id}")

            # 分配学生角色
            cursor.execute("SELECT id FROM roles WHERE code = 'STUDENT'")
            role_result = cursor.fetchone()
            if role_result:
                cursor.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)", (student_id, role_result[0]))

        # 创建一个未回答的问题
        print("正在创建测试问题...")
        cursor.execute("""
            INSERT INTO questions (course_id, student_id, title, content, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
        """, (course_id, student_id, '计算机导论作业问题', '关于第一章的习题，我不太明白怎么做？', 'OPEN'))

        question_id = cursor.lastrowid
        print(f"创建测试问题，ID: {question_id}")

        print("测试数据插入完成！")
        print(f"教师 {teacher_id} 现在应该有 1 个待回答问题。")

        conn.close()

    except Exception as e:
        print(f"数据库操作失败: {e}")

if __name__ == "__main__":
    insert_test_data()
