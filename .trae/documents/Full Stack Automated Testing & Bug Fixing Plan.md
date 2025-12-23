I will perform a comprehensive automated test and fix cycle for the EduShareQA system.

### Phase 1: Environment Preparation
1.  **Database Reset**: Re-initialize the `edushareqa` database using the provided SQL scripts (`schema.sql`, `init-data.sql`) to ensure a clean testing state.
2.  **Dependency Check**: Ensure frontend (`npm install`) and backend dependencies are ready.

### Phase 2: System Startup
1.  **Start Backend**: Launch the Spring Boot application in the background (Port 8080).
2.  **Start Frontend**: Launch the React/Vite development server in the background (Port 5173).
3.  **Health Check**: Verify both services are responsive before proceeding.

### Phase 3: Automated Functional Testing
I will create and run a comprehensive API test script (using Python/Requests) to verify the following workflows:
1.  **Authentication**: Register/Login for Student, Teacher, and Admin roles. Verify JWT token generation.
2.  **Admin Functions**: Create courses, manage users (if applicable).
3.  **Teacher Functions**: Upload course resources, view assigned courses, answer questions.
4.  **Student Functions**: View courses, download resources, ask questions, view answers.
5.  **Error Handling**: Verify system stability when invalid data is submitted.

### Phase 4: Bug Fixing & Verification
*   **Monitor Logs**: Watch backend logs for exceptions or errors during the test.
*   **Auto-Fix**: If any test fails or exceptions occur, I will analyze the code, apply fixes immediately, and re-run the tests.
*   **Final Report**: Once all tests pass, I will provide a summary of what was tested and what bugs were fixed.

### Phase 5: Handover
*   Stop all automated processes.
*   Notify you that the system is ready for your manual inspection.