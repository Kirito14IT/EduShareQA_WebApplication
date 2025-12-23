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

def test_admin_login():
    log("Testing Admin Login...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=ADMIN_USER)
        if resp.status_code == 200:
            log("PASS: Admin login successful")
            print(resp.json())
        else:
            log(f"FAIL: Admin login failed. {resp.status_code} {resp.text}")
    except Exception as e:
        log(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_admin_login()
