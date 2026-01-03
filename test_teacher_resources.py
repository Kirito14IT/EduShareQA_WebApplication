#!/usr/bin/env python3
import requests
import json

# 测试教师资源功能
def test_teacher_resources():
    base_url = "http://localhost:8080/api"

    # 1. 登录教师账号
    login_data = {
        "username": "teacher01",
        "password": "password123"
    }

    print("正在登录教师账号...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"登录状态码: {login_response.status_code}")

    if login_response.status_code != 200:
        print(f"登录失败: {login_response.text}")
        return

    tokens = login_response.json()['data']
    access_token = tokens['accessToken']
    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. 测试获取教师的资源
    print("\n测试获取教师资源...")
    resources_response = requests.get(f"{base_url}/student/resources/my", headers=headers)
    print(f"资源获取状态码: {resources_response.status_code}")

    if resources_response.status_code == 200:
        resources_data = resources_response.json()['data']
        print(f"教师资源: {resources_data}")
        print(f"资源数量: {len(resources_data.get('items', []))}")

        if resources_data.get('items'):
            print("资源列表:")
            for item in resources_data['items'][:3]:  # 只显示前3个
                print(f"  - {item['title']} (ID: {item['id']})")
    else:
        print(f"获取资源失败: {resources_response.text}")

    # 3. 测试教师仪表板统计
    print("\n测试教师仪表板统计...")
    stats_response = requests.get(f"{base_url}/teacher/dashboard/stats", headers=headers)
    print(f"统计获取状态码: {stats_response.status_code}")

    if stats_response.status_code == 200:
        stats = stats_response.json()['data']
        print(f"教师统计: {stats}")
        print(f"总资源数: {stats.get('totalResources', 0)}")

if __name__ == "__main__":
    test_teacher_resources()
