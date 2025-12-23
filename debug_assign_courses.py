import requests
import json
import random
import string
import sys

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
        sys.exit(1)
    
    token = resp.json()['data']['accessToken']
    print("Login successful.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Get first teacher and first course
    teachers_resp = session.get("http://localhost:8080/api/admin/teachers?pageSize=1", headers=headers)
    courses_resp = session.get("http://localhost:8080/api/admin/courses?pageSize=1", headers=headers)
    
    if teachers_resp.status_code != 200 or courses_resp.status_code != 200:
        print("Failed to fetch teachers or courses")
        sys.exit(1)
        
    teachers = teachers_resp.json()['data']['items']
    courses = courses_resp.json()['data']['items']
    
    if not teachers:
        print("No teachers found, cannot test assignment.")
        sys.exit(0)
    if not courses:
        print("No courses found, cannot test assignment.")
        sys.exit(0)
        
    teacher_id = teachers[0]['id']
    course_id = courses[0]['id']
    print(f"Testing assignment for Teacher ID: {teacher_id} -> Course ID: {course_id}")
    
    # 3. Call the API endpoint
    assign_url = f"http://localhost:8080/api/admin/teachers/{teacher_id}/courses"
    payload = {
        "courseIds": [course_id]
    }
    
    print(f"Sending POST to {assign_url} with payload {payload}")
    resp = session.post(assign_url, json=payload, headers=headers)
    print(f"Response Code: {resp.status_code}")
    print(f"Response Body: {resp.text}")
    
    if resp.status_code == 200:
        print("Assignment API call successful.")
    else:
        print("Assignment API call failed.")

except Exception as e:
    print(f"Exception: {e}")
    sys.exit(1)
