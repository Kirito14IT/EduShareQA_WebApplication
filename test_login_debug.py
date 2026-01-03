#!/usr/bin/env python3
import requests
import json

# 测试登录API
def test_login():
    base_url = "http://localhost:8080/api"

    # 登录请求
    login_data = {
        "username": "student01",
        "password": "password123"
    }

    print("正在测试登录...")
    try:
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        print(f"登录响应状态码: {response.status_code}")
        print(f"登录响应内容: {response.text}")

        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('data', {}).get('accessToken')

            if access_token:
                print(f"获取到access token: {access_token[:50]}...")

                # 测试获取用户信息
                headers = {"Authorization": f"Bearer {access_token}"}
                profile_response = requests.get(f"{base_url}/profile/me", headers=headers)
                print(f"获取用户信息响应状态码: {profile_response.status_code}")
                print(f"获取用户信息响应内容: {profile_response.text}")
            else:
                print("登录响应中没有accessToken")
        else:
            print("登录失败")

    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    test_login()
