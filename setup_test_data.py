#!/usr/bin/env python3
import requests
import json

def setup_test_data():
    base_url = "http://localhost:8080/api"

    # 1. 登录管理员账号
    login_data = {
        "username": "admin",
        "password": "admin123"
    }

    print("正在登录管理员账号...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"登录状态码: {login_response.status_code}")

    if login_response.status_code != 200:
        print(f"登录失败: {login_response.text}")
        return

    tokens = login_response.json()['data']
    access_token = tokens['accessToken']
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. 创建教师账号
    teacher_data = {
        "username": "teacher01",
        "email": "teacher01@campus.edu",
        "fullName": "张老师",
        "password": "password123",
        "title": "教授",
        "department": "计算机学院",
        "bio": "计算机专业教师",
        "courseIds": []
    }

    print("正在创建教师账号...")
    teacher_response = requests.post(f"{base_url}/admin/teachers", json=teacher_data, headers=headers)
    print(f"创建教师状态码: {teacher_response.status_code}")
    if teacher_response.status_code != 200:
        print(f"创建教师失败: {teacher_response.text}")

    # 3. 创建课程
    course_data = {
        "code": "CS101",
        "name": "计算机导论",
        "description": "计算机科学基础课程",
        "faculty": "计算机学院",
        "teacherIds": [1]  # 假设教师ID为1
    }

    print("正在创建课程...")
    course_response = requests.post(f"{base_url}/admin/courses", json=course_data, headers=headers)
    print(f"创建课程状态码: {course_response.status_code}")
    if course_response.status_code != 200:
        print(f"创建课程失败: {course_response.text}")

    # 4. 创建学生账号
    student_data = {
        "username": "student01",
        "fullName": "李同学",
        "email": "student01@campus.edu",
        "password": "password123",
        "department": "计算机学院",
        "schoolId": "2021001"
    }

    print("正在注册学生账号...")
    student_response = requests.post(f"{base_url}/auth/register", json=student_data)
    print(f"注册学生状态码: {student_response.status_code}")
    if student_response.status_code != 200:
        print(f"注册学生失败: {student_response.text}")

    print("测试数据设置完成！")

if __name__ == "__main__":
    setup_test_data()
