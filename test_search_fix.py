#!/usr/bin/env python3
import requests
import json

# 测试学生提问搜索功能
def test_student_search():
    base_url = "http://localhost:8080/api"

    # 先登录获取token (学生账号)
    login_data = {
        "username": "student01",
        "password": "password123"
    }

    print("正在登录学生账号...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"登录状态码: {login_response.status_code}")

    if login_response.status_code == 200:
        tokens = login_response.json()['data']
        access_token = tokens['accessToken']
        headers = {"Authorization": f"Bearer {access_token}"}

        # 测试搜索问题 - 使用正确的API路径
        print("\n测试搜索问题...")
        search_params = {
            "keyword": "问题",
            "page": 1,
            "pageSize": 5
        }

        search_response = requests.get(f"{base_url}/student/questions", params=search_params, headers=headers)
        print(f"搜索状态码: {search_response.status_code}")

        if search_response.status_code == 200:
            result = search_response.json()['data']
            print(f"搜索结果: {result['total']} 条记录")
            if result['items']:
                print("前3个结果:")
                for i, item in enumerate(result['items'][:3]):
                    print(f"  {i+1}. {item['title']} - {item['status']}")
        else:
            print(f"搜索失败: {search_response.text}")

        # 测试按课程搜索
        print("\n测试按课程搜索...")
        course_search_params = {
            "courseId": 1,  # 假设课程ID为1
            "page": 1,
            "pageSize": 5
        }

        course_response = requests.get(f"{base_url}/student/questions", params=course_search_params, headers=headers)
        print(f"课程搜索状态码: {course_response.status_code}")

        if course_response.status_code == 200:
            result = course_response.json()['data']
            print(f"课程搜索结果: {result['total']} 条记录")
    else:
        print("登录失败")

if __name__ == "__main__":
    test_student_search()
