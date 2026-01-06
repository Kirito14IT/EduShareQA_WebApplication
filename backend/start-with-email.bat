@echo off
REM 使用配置好的QQ邮箱启动应用

echo ========================================
echo EduShareQA - QQ邮箱配置启动脚本
echo ========================================
echo.
echo 当前配置：
echo 邮箱: 2657751462@qq.com
echo 授权码: [已配置]
echo.
echo 🚀 正在启动应用...
echo.

REM 设置环境变量
set MAIL_USERNAME=2657751462@qq.com
set MAIL_PASSWORD=broqftimcppddiga

echo 📋 启动信息：
echo - 前端访问: http://localhost:3000
echo - 后端API: http://localhost:8080/api
echo - 邮件测试: curl -X POST "http://localhost:8080/api/auth/test-email?email=2657751462@qq.com"
echo.
echo ⚠️  重要提示：
echo 如果看到"Authentication failed"错误，请：
echo 1. 运行 .\check-email-status.bat 检查配置
echo 2. 运行 .\update-email-config.bat 更新授权码
echo 3. 确认QQ邮箱SMTP服务已开启
echo.

REM 启动应用
mvn spring-boot:run

pause
