@echo off
REM 快速设置QQ邮箱环境变量的脚本

echo ========================================
echo EduShareQA QQ邮箱快速配置脚本
echo ========================================
echo.

echo 请按照以下步骤操作：
echo.

set /p MAIL_USERNAME="请输入您的QQ邮箱地址 (如: xxx@qq.com): "
if "%MAIL_USERNAME%"=="" (
    echo 邮箱地址不能为空！
    goto :end
)

echo.
echo 重要提醒：
echo - 授权码不是QQ密码！
echo - 授权码是16位数字字母组合
echo - 需要先开启QQ邮箱的SMTP服务
echo.

set /p MAIL_PASSWORD="请输入您的QQ邮箱授权码 (16位): "
if "%MAIL_PASSWORD%"=="" (
    echo 授权码不能为空！
    goto :end
)

echo.
echo 正在设置环境变量...

REM 设置用户级别的环境变量（永久）
setx MAIL_USERNAME "%MAIL_USERNAME%" /M
setx MAIL_PASSWORD "%MAIL_PASSWORD%" /M

echo.
echo ========================================
echo 配置完成！
echo ========================================
echo.
echo 已设置的环境变量：
echo MAIL_USERNAME = %MAIL_USERNAME%
echo MAIL_PASSWORD = %MAIL_PASSWORD%
echo.
echo 注意：需要重启命令提示符窗口或重启应用才能生效
echo.
echo 测试方法：
echo 1. 重启应用
echo 2. 访问: http://localhost:8080/api/auth/test-email?email=test@example.com
echo 3. 如果收到邮件，说明配置成功
echo ========================================

:end
pause
