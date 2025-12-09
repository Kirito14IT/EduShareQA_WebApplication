@echo off
echo Starting EduShareQA Backend...
echo.

REM 检查Java是否安装
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install JDK 17 or higher
    pause
    exit /b 1
)

REM 检查Maven是否安装
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo Building project...
call mvn clean compile -DskipTests

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application...
echo API will be available at: http://localhost:8080/api
echo.

call mvn spring-boot:run

pause

