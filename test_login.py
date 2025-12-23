import requests
import sys

BASE_URL = "http://localhost:8080/api"

# Test Data
EMAIL_USER = {
    "username": "3657751462@qq.com",
    "password": "wzh521016"
}

def log(msg):
    print(f"[TEST] {msg}")

def test_email_login():
    log("Testing login with email...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=EMAIL_USER)
        if resp.status_code == 200:
            log("PASS: Login with email successful")
            print(resp.json())
        else:
            log(f"FAIL: Login with email failed. {resp.status_code} {resp.text}")
    except Exception as e:
        log(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_email_login()
