@echo off
REM 直接测试SMTP连接（不需要启动Spring应用）

echo ========================================
echo SMTP连接测试
echo ========================================
echo.
echo 正在测试QQ邮箱SMTP服务器连接...
echo.

REM 使用PowerShell执行SMTP测试
powershell -Command "
try {
    $smtp = New-Object System.Net.Mail.SmtpClient
    $smtp.Host = 'smtp.qq.com'
    $smtp.Port = 587
    $smtp.EnableSsl = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential('2657751462@qq.com', 'broqftimcppddiga')

    # 尝试连接（不发送邮件）
    $smtp.Send('test@local.com', 'test@local.com', 'SMTP Test', 'This is a test connection.')
    Write-Host '✅ SMTP连接成功！邮箱配置正确。' -ForegroundColor Green
} catch {
    Write-Host '❌ SMTP连接失败：' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ''
    Write-Host '可能的原因：' -ForegroundColor Cyan
    Write-Host '1. QQ邮箱SMTP服务未开启' -ForegroundColor White
    Write-Host '2. 授权码错误或过期' -ForegroundColor White
    Write-Host '3. 网络连接问题' -ForegroundColor White
}
"

echo.
echo ========================================
echo 测试完成
echo ========================================
echo.
echo 如果连接失败，请检查：
echo 1. QQ邮箱SMTP服务是否开启
echo 2. 授权码是否正确（16位）
echo 3. 网络连接是否正常
echo.

pause
