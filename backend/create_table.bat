@echo off
REM 创建密码重置验证码表的批处理脚本

echo 执行数据库表创建脚本...
mysql -h 118.89.81.131 -u clouduser -p123456 edushareqa < create_password_reset_table.sql

if %errorlevel% equ 0 (
    echo 表创建成功！
) else (
    echo 表创建失败！
)

pause
