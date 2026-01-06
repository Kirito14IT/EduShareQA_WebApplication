package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.*;
import com.edushareqa.service.AuthService;
import com.edushareqa.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ApiResponse<AuthTokens> register(@Valid @RequestBody RegisterRequest request) {
        AuthTokens tokens = authService.register(request);
        return ApiResponse.success(tokens);
    }
    
    @PostMapping("/login")
    public ApiResponse<AuthTokens> login(@Valid @RequestBody LoginRequest request) {
        AuthTokens tokens = authService.login(request);
        return ApiResponse.success(tokens);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success(null);
    }

    @PostMapping("/verify-reset-token")
    public ApiResponse<Void> verifyResetToken(@Valid @RequestBody VerifyResetTokenRequest request) {
        authService.verifyResetToken(request);
        return ApiResponse.success(null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success(null);
    }

    // 测试邮件发送（仅开发环境使用）
    @PostMapping("/test-email")
    public ApiResponse<Void> testEmail(@RequestParam String email) {
        try {
            authService.sendTestEmail(email);
            return ApiResponse.success(null);
        } catch (Exception e) {
            String errorMsg = "邮件发送失败: " + e.getMessage();
            if (e.getMessage().contains("Authentication failed")) {
                errorMsg += "\n\n请检查：\n1. QQ邮箱SMTP服务是否开启\n2. 16位授权码是否正确\n3. 环境变量 MAIL_USERNAME 和 MAIL_PASSWORD 是否设置";
            }
            return ApiResponse.error(errorMsg);
        }
    }

}

