#!/usr/bin/env python3
import requests
import json

# 测试教师通知功能
def test_teacher_notifications():
    base_url = "http://localhost:8080/api"

    # 先登录教师账号
    login_data = {
        "username": "teacher01",
        "password": "password123"
    }

    print("正在登录教师账号...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"登录状态码: {login_response.status_code}")

    if login_response.status_code == 200:
        tokens = login_response.json()['data']
        access_token = tokens['accessToken']
        headers = {"Authorization": f"Bearer {access_token}"}

        # 测试获取通知计数
        print("\n测试获取教师通知计数...")
        count_response = requests.get(f"{base_url}/notifications/unread-count", headers=headers)
        print(f"通知计数状态码: {count_response.status_code}")

        if count_response.status_code == 200:
            counts = count_response.json()['data']
            print(f"Notification counts: {counts}")
            print(f"New answers: {counts.get('newAnswers', 0)}")
            print(f"Pending questions: {counts.get('pendingQuestions', 0)}")

            # Check if teacher has pending questions
            pending_questions = counts.get('pendingQuestions', 0)
            if pending_questions > 0:
                print(f"Teacher has {pending_questions} pending questions")
            else:
                print("Teacher has no pending questions")
        else:
            print(f"获取通知计数失败: {count_response.text}")

        # 同时测试教师仪表板数据进行对比
        print("\n测试教师仪表板数据...")
        dashboard_response = requests.get(f"{base_url}/teacher/dashboard/stats", headers=headers)
        print(f"仪表板状态码: {dashboard_response.status_code}")

        if dashboard_response.status_code == 200:
            stats = dashboard_response.json()['data']
            print(f"仪表板数据: {stats}")
            print(f"仪表板显示的待回答问题: {stats.get('pendingQuestions', 0)}")
    else:
        print(f"登录失败: {login_response.text}")

if __name__ == "__main__":
    test_teacher_notifications()
