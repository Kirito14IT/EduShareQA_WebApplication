The error is `java.sql.SQLIntegrityConstraintViolationException: Cannot add or update a child row: a foreign key constraint fails` on table `resources`.
Specifically: `FOREIGN KEY (course_id) REFERENCES courses (id)`.

This means the `courseId` being sent in the upload request does not exist in the `courses` table.

### Diagnosis
1.  **Frontend Issue?**: The frontend might be sending an invalid or null `courseId`.
2.  **Database Issue?**: The course might have been deleted, or the ID is simply wrong.
3.  **Code Logic?**: The `StudentResourceController` receives `metadata` as a JSON string. If the parsing fails or the `courseId` is missing in that JSON, it might default to null or an invalid value, causing this DB error.

However, the error log shows the SQL:
`INSERT INTO resources ... VALUES ( ?, ?, ?, ?, ... )`
And the error says the foreign key fails.

I suspect the user is trying to upload a resource to a course that **does not exist** or the `courseId` is being passed incorrectly from the frontend.

### Plan
1.  **Verify Course Existence**: I'll check if there are any courses in the database.
2.  **Create Test Case**: I'll create a python script `test_upload.py` that:
    *   Logs in as a teacher/student.
    *   Creates a valid course (to ensure one exists).
    *   Attempts to upload a resource to that **valid** course ID.
    *   Attempts to upload a resource to an **invalid** course ID (to reproduce the error).
3.  **Fix**:
    *   If the issue is just "user selected a non-existent course" (which shouldn't happen in a good UI), I should add a check in `ResourceService.java` to verify the course exists *before* trying to insert, so we can return a friendly "Course not found" error instead of a raw SQL exception.
    *   I will add this check to `ResourceService.uploadResource`.

### Steps
1.  **Check DB**: See if any courses exist.
2.  **Reproduce**: Write script to upload to a non-existent course ID.
3.  **Fix Code**: Add `courseMapper.selectById(courseId)` check in `ResourceService.java`.
4.  **Verify**: Run script again to see friendly error message.
