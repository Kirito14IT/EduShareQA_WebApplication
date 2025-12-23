# Fix Teacher Submission Error (Missing DB Columns)

## Diagnosis
The `users` table in the database is missing the `title` and `bio` columns.
- The backend `User` entity includes these fields (`private String title;`, `private String bio;`).
- The `TeacherService` attempts to save these fields when creating/updating a teacher.
- This mismatch causes a SQL exception (likely `BadSqlGrammarException`) when submitting the form, resulting in a 500 error which the frontend catches and logs as "Submit error".

## Implementation Plan

### 1. Fix Database Schema (Runtime)
Create and execute a Python script `fix_db_schema.py` to alter the running database table `users` and add the missing columns.
- **Action**: Add `title` column (VARCHAR(64)) and `bio` column (TEXT).
- **Credentials**: Use `localhost:3308`, user `root`, password `123456` (from `application.yml`).

### 2. Update Schema Definition (Source)
Update `backend/src/main/resources/db/schema.sql` to include `title` and `bio` in the `users` table definition.
- This ensures that future database initializations will have the correct schema.

### 3. Verification
Create a Python test script `test_create_teacher_success.py` to verify the fix.
- **Steps**:
    1. Login as admin.
    2. Create a new teacher with all fields (including title and bio).
    3. Verify the response is 200 OK and returns the created teacher data.
- **Run**: Execute the test script to confirm the fix.
