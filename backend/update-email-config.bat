@echo off
REM 更新QQ邮箱配置

echo ========================================
echo 更新QQ邮箱配置
echo ========================================
echo.

set /p MAIL_USERNAME="请输入QQ邮箱地址 (默认: 2657751462@qq.com): "
if "%MAIL_USERNAME%"=="" set MAIL_USERNAME=2657751462@qq.com

echo.
set /p MAIL_PASSWORD="请输入新的16位授权码: "
if "%MAIL_PASSWORD%"=="" (
    echo 授权码不能为空！
    goto :end
)

echo.
echo 正在更新配置...
echo.

REM 更新批处理文件
(
echo @echo off
echo REM 使用配置好的QQ邮箱启动应用
echo.
echo echo ========================================
echo echo EduShareQA - QQ邮箱配置启动脚本
echo echo ========================================
echo echo.
echo echo 当前配置：
echo echo 邮箱: %MAIL_USERNAME%
echo echo 授权码: %MAIL_PASSWORD%
echo echo.
echo echo 如果认证失败，请运行 debug-email.bat 进行诊断
echo echo.
echo.
echo REM 设置环境变量
echo set MAIL_USERNAME=%MAIL_USERNAME%
echo set MAIL_PASSWORD=%MAIL_PASSWORD%
echo.
echo echo 正在启动应用...
echo echo 启动完成后访问: http://localhost:8080
echo echo 测试邮件: curl -X POST "http://localhost:8080/api/auth/test-email?email=%MAIL_USERNAME%"
echo echo.
echo.
echo REM 启动应用
echo mvn spring-boot:run
echo.
echo pause
) > start-with-email.bat

echo 配置已更新！
echo.
echo 新配置：
echo 邮箱: %MAIL_USERNAME%
echo 授权码: %MAIL_PASSWORD%
echo.
echo 请重启应用以应用新配置。

:end
pause
