@echo off
REM 调试QQ邮箱配置

echo ========================================
echo QQ邮箱配置调试工具
echo ========================================
echo.
echo 当前配置：
echo 邮箱: 2657751462@qq.com
echo 授权码: broqftimcppddiga
echo.
echo 正在测试应用连接...
echo.

curl -X POST "http://localhost:8080/api/auth/test-email?email=2657751462@qq.com"

echo.
echo ========================================
echo 如果看到认证失败，请按以下步骤检查：
echo ========================================
echo.
echo 1. 登录QQ邮箱网页版: https://mail.qq.com
echo.
echo 2. 点击右上角设置图标 → 账户
echo.
echo 3. 找到"SMTP服务"，确认显示"已开启"
echo    - 如果显示"未开启"，请点击开启
echo    - 开启时需要发送短信验证
echo.
echo 4. 查看"SMTP服务"下面的授权码
echo    - 如果没有授权码，点击"生成授权码"
echo    - 复制新的16位授权码
echo.
echo 5. 更新授权码
echo    - 编辑 start-with-email.bat 文件
echo    - 将授权码替换为新的
echo.
echo 6. 重启应用
echo    - 关闭当前命令窗口
echo    - 重新运行 start-with-email.bat
echo ========================================

pause
