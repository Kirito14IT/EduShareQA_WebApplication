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

def test_create_teacher():
    log("1. Login as Admin")
    resp = requests.post(f"{BASE_URL}/auth/login", json=ADMIN_USER)
    if resp.status_code != 200:
        log(f"FAIL: Login failed. {resp.status_code} {resp.text}")
        return
    token = resp.json()['data']['accessToken']
    headers = {"Authorization": f"Bearer {token}"}
    
    log("2. Create Teacher")
    new_teacher = {
        "username": "test_teacher_v1",
        "email": "test_v1@test.com",
        "fullName": "Test Teacher V1",
        "password": "Password123!",
        "department": "CS",
        "title": "Professor",
        "bio": "Test Bio",
        "courseIds": []
    }
    
    resp = requests.post(f"{BASE_URL}/admin/teachers", headers=headers, json=new_teacher)
    log(f"Response: {resp.status_code} {resp.text}")
    
    if resp.status_code == 200:
        log("SUCCESS: Teacher created")
        # Cleanup
        teacher_id = resp.json()['data']['id']
        requests.delete(f"{BASE_URL}/admin/teachers/{teacher_id}", headers=headers)
        log("Cleanup: Deleted test teacher")
    else:
        log("FAIL: Create teacher failed")

if __name__ == "__main__":
    test_create_teacher()
