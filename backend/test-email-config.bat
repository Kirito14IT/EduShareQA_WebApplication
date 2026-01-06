@echo off
REM 测试QQ邮箱配置的批处理脚本

echo ========================================
echo EduShareQA QQ邮箱配置测试工具
echo ========================================
echo.

echo 当前环境变量检查：
echo MAIL_USERNAME: %MAIL_USERNAME%
echo MAIL_PASSWORD: %MAIL_PASSWORD%
echo.

if "%MAIL_USERNAME%"=="" (
    echo [错误] MAIL_USERNAME 环境变量未设置
    echo 请设置您的QQ邮箱地址
    goto :config
)

if "%MAIL_PASSWORD%"=="" (
    echo [错误] MAIL_PASSWORD 环境变量未设置
    echo 请设置您的QQ邮箱授权码
    goto :config
)

echo [信息] 环境变量已配置，开始测试...
echo.

echo 测试连接到SMTP服务器...
echo 如果看到认证失败，请检查：
echo 1. QQ邮箱是否开启了SMTP服务
echo 2. 授权码是否正确（16位）
echo 3. 网络连接是否正常
echo.

cd /d "%~dp0"
java -DMAIL_USERNAME=%MAIL_USERNAME% -DMAIL_PASSWORD=%MAIL_PASSWORD% -jar target/edushareqa-backend-1.0.0.jar

goto :end

:config
echo ========================================
echo 配置步骤：
echo ========================================
echo.
echo 1. 开启QQ邮箱SMTP服务：
echo    - 登录 https://mail.qq.com
echo    - 设置 → 账户 → SMTP服务 → 开启
echo    - 获取16位授权码
echo.
echo 2. 设置环境变量：
echo    setx MAIL_USERNAME "你的QQ邮箱@qq.com"
echo    setx MAIL_PASSWORD "你的16位授权码"
echo.
echo 3. 重启命令提示符窗口
echo.
echo 4. 重新运行此脚本
echo ========================================

:end
pause
