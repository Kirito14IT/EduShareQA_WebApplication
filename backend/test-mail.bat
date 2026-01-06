@echo off
REM 测试邮件发送的批处理脚本

echo ========================================
echo EduShareQA 邮件配置测试
echo ========================================
echo.
echo 请按以下步骤配置邮箱：
echo 1. 登录QQ邮箱网页版
echo 2. 开启SMTP服务并获取16位授权码
echo 3. 替换下面的邮箱和授权码
echo.
echo ========================================

set MAIL_USERNAME=你的QQ邮箱@qq.com
set MAIL_PASSWORD=你的16位授权码

echo 当前配置：
echo 邮箱: %MAIL_USERNAME%
echo 授权码: %MAIL_PASSWORD%
echo.

echo 正在启动应用进行邮件测试...
echo 测试完成后，请检查邮箱是否收到测试邮件
echo.

cd /d "%~dp0"
java -DMAIL_USERNAME=%MAIL_USERNAME% -DMAIL_PASSWORD=%MAIL_PASSWORD% -jar target/edushareqa-backend-1.0.0.jar

pause
