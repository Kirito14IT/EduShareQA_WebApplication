import requests
import json

BASE_URL = "http://localhost:8080/api"

# Login as Teacher first
TEACHER_USER = {
    "username": "teacher_smzo19", # From previous run
    "password": "Password123!"
}

def log(msg):
    print(f"[TEST] {msg}")

def test_upload_invalid_course():
    log("1. Login as Teacher")
    resp = requests.post(f"{BASE_URL}/auth/login", json=TEACHER_USER)
    if resp.status_code != 200:
        log(f"FAIL: Login failed. {resp.status_code} {resp.text}")
        return
    token = resp.json()['data']['accessToken']
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Try to upload to invalid course ID
    log("2. Upload to invalid course ID (99999)")
    metadata = {
        'title': 'Test Resource',
        'summary': 'Should fail',
        'courseId': 99999,
        'visibility': 'PUBLIC'
    }
    
    files = {
        'file': ('test.txt', 'content', 'text/plain'),
        'metadata': (None, json.dumps(metadata), 'application/json')
    }
    
    resp = requests.post(f"{BASE_URL}/student/resources", headers=headers, files=files)
    log(f"Response: {resp.status_code} {resp.text}")
    if resp.status_code == 500 and "constraint fails" in resp.text:
        log("SUCCESS: Reproduced SQL Constraint Error")
    elif resp.status_code == 500 and "课程不存在" in resp.text:
        log("SUCCESS: Fixed! Got friendly error message.")
    else:
        log("Unexpected response.")

if __name__ == "__main__":
    test_upload_invalid_course()
