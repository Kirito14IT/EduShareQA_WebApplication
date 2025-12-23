import requests
import json

# 1. Login as Admin
login_url = "http://localhost:8080/api/auth/login"
login_payload = {
    "username": "admin",
    "password": "admin123"
}

try:
    session = requests.Session()
    resp = session.post(login_url, json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        exit(1)
    
    token = resp.json()['data']['accessToken']
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Try to create teacher WITHOUT username (simulate user missing the field)
    create_url = "http://localhost:8080/api/admin/teachers"
    payload = {
        # "username": "wangzhihai",  <-- MISSING
        "email": "234@qq.com",
        "fullName": "王志海",
        "password": "password123",
        "title": "jaio",
        "department": "ferav",
        "bio": "evra",
        "courseIds": []
    }
    
    print("Sending payload without username...")
    resp = session.post(create_url, json=payload, headers=headers)
    print(f"Response Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")
    
    # 3. Try to create teacher WITH empty username
    payload["username"] = ""
    print("\nSending payload with empty username...")
    resp = session.post(create_url, json=payload, headers=headers)
    print(f"Response Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")

except Exception as e:
    print(f"Exception: {e}")
