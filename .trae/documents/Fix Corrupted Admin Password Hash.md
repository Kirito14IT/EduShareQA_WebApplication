The admin password hash in the database is corrupted.
It currently shows: `.CFYIyIelq/XWmdOY54FkY4zwkETLOaO`
This is **NOT** a valid BCrypt hash (which should start with `$2a$10$...`). It looks like a truncated string or a bad copy-paste operation happened during a previous manual update or SQL execution.

### Diagnosis
The previous manual update of the password hash likely failed or was truncated, resulting in an invalid hash string in the database. Since the hash is invalid, `BCryptPasswordEncoder` cannot match the password `admin123` against it, leading to "Username or password error".

### Plan
1.  **Reproduce**: Create `test_admin_login.py` to confirm login fails.
2.  **Fix**: Update the `users` table with a known valid BCrypt hash for `admin123`.
    *   Valid Hash for `admin123`: `$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ/2` (This is the one from the original `init-data.sql` which we know works, or I can generate a new one). Let's use the one from the original SQL file or the one I tried to use earlier but correctly this time.
    *   Earlier I tried to use `$2a$10$8AvSLrO1wDmDx7K0k6OUp.CFYIyIelq/XWmdOY54FkY4zwkETLOaO`. The current DB value `.CFYIyIelq/XWmdOY54FkY4zwkETLOaO` is exactly the *suffix* of that hash!
    *   It seems the `UPDATE` command might have been truncated or interpreted incorrectly by the shell when I ran it previously, or the column length is too short?
    *   Wait, `password_hash` column is `VARCHAR(255)`, so length is fine.
    *   The issue was likely how I passed the string in the shell command previously, perhaps the `$` sign was interpreted as a variable in PowerShell/Bash and stripped out the prefix!
    *   **CRITICAL**: When running SQL update via shell, `$` characters in the hash string (`$2a$10$...`) MUST be escaped or single-quoted properly to prevent shell expansion.

3.  **Verify**: Run `test_admin_login.py` to confirm success.

### Steps
1.  Create `test_admin_login.py`.
2.  Run `mysql` update command, carefully escaping the hash string.
3.  Run `test_admin_login.py`.
