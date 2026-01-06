@echo off
REM 检查QQ邮箱配置状态

echo ========================================
echo QQ邮箱配置状态检查
echo ========================================
echo.

echo [1/3] 检查环境变量...
echo.

if "%MAIL_USERNAME%"=="" (
    echo ❌ MAIL_USERNAME 未设置
) else (
    echo ✅ MAIL_USERNAME: %MAIL_USERNAME%
)

if "%MAIL_PASSWORD%"=="" (
    echo ❌ MAIL_PASSWORD 未设置
) else (
    echo ✅ MAIL_PASSWORD: [已设置，长度%MAIL_PASSWORD_LENGTH%位]
)

echo.
echo [2/3] 检查应用状态...
echo.

curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/auth/test-email?email=test@example.com > temp_code.txt
set /p HTTP_CODE=<temp_code.txt
del temp_code.txt

if "%HTTP_CODE%"=="200" (
    echo ✅ 应用运行正常
) else (
    echo ❌ 应用未运行或端口不可用 (HTTP状态: %HTTP_CODE%)
    echo 请先运行 start-with-email.bat 启动应用
    goto :end
)

echo.
echo [3/3] 测试邮件发送...
echo.

curl -X POST "http://localhost:8080/api/auth/test-email?email=2657751462@qq.com" 2>nul

echo.
echo ========================================
echo 故障排除步骤：
echo ========================================
echo.
echo 如果看到"Authentication failed"错误：
echo.
echo 1. 登录QQ邮箱网页版: https://mail.qq.com
echo.
echo 2. 设置 → 账户 → SMTP服务
echo    - 确保显示"已开启"
echo    - 如果未开启，点击开启并完成验证
echo.
echo 3. 查看授权码
echo    - 如果没有授权码，点击"生成授权码"
echo    - 复制16位授权码（不是QQ密码）
echo.
echo 4. 更新配置
echo    - 运行: update-email-config.bat
echo    - 输入新的授权码
echo.
echo 5. 重启应用
echo    - 运行: .\start-with-email.bat
echo ========================================

:end
echo.
pause
