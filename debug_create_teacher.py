import requests
import json
import random
import string

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

# 1. Login as Admin
login_url = "http://localhost:8080/api/auth/login"
login_payload = {
    "username": "admin",
    "password": "admin123"
}

try:
    session = requests.Session()
    print(f"Logging in to {login_url}...")
    resp = session.post(login_url, json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        exit(1)
    
    token = resp.json()['data']['accessToken']
    print("Login successful.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Try to create a VALID teacher
    username = "teacher_" + generate_random_string()
    email = username + "@example.com"
    
    create_url = "http://localhost:8080/api/admin/teachers"
    payload = {
        "username": username,
        "email": email,
        "fullName": "Test Teacher " + username,
        "password": "password123",
        "title": "Professor",
        "department": "Computer Science",
        "bio": "A test teacher bio.",
        "courseIds": []
    }
    
    print(f"Creating teacher with username: {username}...")
    resp = session.post(create_url, json=payload, headers=headers)
    print(f"Response Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")
    
    if resp.status_code == 200:
        print("Teacher created successfully!")
    else:
        print("Failed to create teacher.")

except Exception as e:
    print(f"Exception: {e}")
