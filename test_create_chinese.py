import requests
import json

BASE_URL = "http://localhost:8080/api"

# Admin Credentials
ADMIN_USER = {
    "username": "admin",
    "password": "admin123"
}

def log(msg):
    print(f"[TEST] {msg}")

def test_create_chinese_teacher():
    log("1. Login as Admin")
    resp = requests.post(f"{BASE_URL}/auth/login", json=ADMIN_USER)
    if resp.status_code != 200:
        log(f"FAIL: Login failed. {resp.status_code} {resp.text}")
        return
    token = resp.json()['data']['accessToken']
    headers = {"Authorization": f"Bearer {token}"}
    
    log("2. Create Teacher with Chinese Characters")
    new_teacher = {
        "username": "VR他",
        "email": "344@oefj.com",
        "fullName": "frs",
        "password": "Password123!",
        "department": "光电",
        "title": "教授",
        "bio": "Iy6hu\n简介",
        "courseIds": []
    }
    
    resp = requests.post(f"{BASE_URL}/admin/teachers", headers=headers, json=new_teacher)
    log(f"Response Status: {resp.status_code}")
    log(f"Response Body: {resp.text}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data['code'] == 0:
            log("SUCCESS: Teacher created")
            teacher_id = data['data']['id']
            # Cleanup
            requests.delete(f"{BASE_URL}/admin/teachers/{teacher_id}", headers=headers)
        else:
            log(f"FAIL: Business Error: {data['message']}")
    else:
        log("FAIL: HTTP Error")

if __name__ == "__main__":
    test_create_chinese_teacher()
