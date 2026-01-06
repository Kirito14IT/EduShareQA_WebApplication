package com.edushareqa.service;

import com.edushareqa.dto.*;
import com.edushareqa.entity.User;
import com.edushareqa.entity.UserRole;
import com.edushareqa.entity.PasswordResetToken;
import com.edushareqa.mapper.RoleMapper;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.mapper.UserRoleMapper;
import com.edushareqa.mapper.PasswordResetTokenMapper;
import com.edushareqa.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private PasswordResetTokenMapper passwordResetTokenMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthTokens register(RegisterRequest request) {
        // 检查用户名和邮箱是否已存在
        if (userMapper.selectByUsername(request.getUsername()) != null) {
            throw new RuntimeException("用户名已存在");
        }
        if (userMapper.selectByEmail(request.getEmail()) != null) {
            throw new RuntimeException("邮箱已被注册");
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setSchoolId(request.getSchoolId());
        user.setDepartment(request.getDepartment());
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        userMapper.insert(user);
        
        // 分配学生角色
        var studentRole = roleMapper.selectByCode("STUDENT");
        if (studentRole != null) {
            UserRole userRole = new UserRole();
            userRole.setUserId(user.getId());
            userRole.setRoleId(studentRole.getId());
            userRole.setCreatedAt(LocalDateTime.now());
            userRoleMapper.insert(userRole);
        }
        
        // 生成Token
        List<String> roles = List.of("STUDENT");
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername(), roles);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());
        
        AuthTokens tokens = new AuthTokens();
        tokens.setAccessToken(accessToken);
        tokens.setRefreshToken(refreshToken);
        tokens.setExpiresIn(900L); // 15分钟
        
        return tokens;
    }
    
    public AuthTokens login(LoginRequest request) {
        // 先查询用户是否存在
        User user = userMapper.selectByUsernameOrEmail(request.getUsername());
        if (user == null) {
            throw new RuntimeException("不存在用户");
        }

        // 再验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("密码错误");
        }
        
        List<String> roles = userRoleMapper.selectRoleCodesByUserId(user.getId());
        
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername(), roles);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());
        
        AuthTokens tokens = new AuthTokens();
        tokens.setAccessToken(accessToken);
        tokens.setRefreshToken(refreshToken);
        tokens.setExpiresIn(900L);
        
        return tokens;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // 查找用户
        User user = userMapper.selectByEmail(request.getEmail());
        if (user == null) {
            throw new RuntimeException("邮箱不存在");
        }

        // 生成6位数字验证码
        String token = generateResetToken();

        // 创建重置令牌记录
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setEmail(request.getEmail());
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // 15分钟过期
        resetToken.setUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());

        passwordResetTokenMapper.insert(resetToken);

        // 发送邮件验证码
        try {
            emailService.sendPasswordResetCode(request.getEmail(), token);
        } catch (Exception e) {
            // 如果邮件发送失败，删除刚创建的token记录
            passwordResetTokenMapper.deleteById(resetToken.getId());

            // 提供更详细的错误信息
            String errorMsg = "验证码发送失败，请检查邮箱配置: " + e.getMessage();
            if (e.getMessage().contains("Authentication failed")) {
                errorMsg = "邮箱认证失败，请检查：1.QQ邮箱SMTP服务是否开启 2.授权码是否正确 3.环境变量是否设置";
            } else if (e.getMessage().contains("connect")) {
                errorMsg = "网络连接失败，请检查网络连接或QQ邮箱服务器状态";
            }

            throw new RuntimeException(errorMsg);
        }
    }

    @Transactional
    public void verifyResetToken(VerifyResetTokenRequest request) {
        PasswordResetToken token = passwordResetTokenMapper.selectValidToken(
            request.getToken(), LocalDateTime.now());

        if (token == null || !token.getEmail().equals(request.getEmail())) {
            throw new RuntimeException("验证码无效或已过期");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 验证验证码
        PasswordResetToken token = passwordResetTokenMapper.selectValidToken(
            request.getToken(), LocalDateTime.now());

        if (token == null || !token.getEmail().equals(request.getEmail())) {
            throw new RuntimeException("验证码无效或已过期");
        }

        // 更新密码
        User user = userMapper.selectById(token.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        // 标记验证码为已使用
        passwordResetTokenMapper.markTokenAsUsed(request.getToken());
    }

    public void sendTestEmail(String email) {
        emailService.sendPasswordResetCode(email, "123456");
    }

    private String generateResetToken() {
        // 生成6位随机数字
        return String.format("%06d", (int)(Math.random() * 1000000));
    }
}

