#!/usr/bin/env python3
import requests
import json

# 测试通知相关API
def test_notifications():
    base_url = "http://localhost:8080/api"

    # 先登录获取token
    login_data = {
        "username": "student01",
        "password": "password123"
    }

    print("正在登录...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"登录状态码: {login_response.status_code}")

    if login_response.status_code == 200:
        tokens = login_response.json()['data']
        access_token = tokens['accessToken']
        headers = {"Authorization": f"Bearer {access_token}"}

        # 测试获取通知计数
        print("\n测试获取通知计数...")
        count_response = requests.get(f"{base_url}/notifications/unread-count", headers=headers)
        print(f"通知计数状态码: {count_response.status_code}")
        if count_response.status_code == 200:
            print(f"通知计数: {count_response.json()['data']}")

        # 测试标记为已读
        print("\n测试标记通知为已读...")
        mark_response = requests.post(f"{base_url}/notifications/mark-read", headers=headers)
        print(f"标记已读状态码: {mark_response.status_code}")

        # 再次获取通知计数
        print("\n再次获取通知计数...")
        count_response2 = requests.get(f"{base_url}/notifications/unread-count", headers=headers)
        print(f"通知计数状态码: {count_response2.status_code}")
        if count_response2.status_code == 200:
            print(f"通知计数: {count_response2.json()['data']}")

        # 测试获取通知列表
        print("\n测试获取通知列表...")
        list_response = requests.get(f"{base_url}/notifications/list", headers=headers)
        print(f"通知列表状态码: {list_response.status_code}")
        if list_response.status_code == 200:
            notifications = list_response.json()['data']
            print(f"通知数量: {len(notifications)}")
            for notification in notifications[:3]:  # 只显示前3个
                print(f"- {notification['type']}: {notification['message']}")
    else:
        print("登录失败")

if __name__ == "__main__":
    test_notifications()
