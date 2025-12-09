package com.edushareqa.service;

import com.edushareqa.dto.ProfileUpdate;
import com.edushareqa.dto.UserProfile;
import com.edushareqa.entity.User;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.mapper.UserRoleMapper;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private UserRoleMapper userRoleMapper;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public UserProfile getCurrentUserProfile(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        User user = userMapper.selectById(userId);
        List<String> roles = userRoleMapper.selectRoleCodesByUserId(userId);
        
        UserProfile profile = new UserProfile();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setFullName(user.getFullName());
        profile.setDepartment(user.getDepartment());
        profile.setAvatarUrl(user.getAvatarUrl());
        profile.setSchoolId(user.getSchoolId());
        profile.setRoles(roles);
        
        return profile;
    }
    
    @Transactional
    public UserProfile updateProfile(HttpServletRequest request, ProfileUpdate update) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        User user = userMapper.selectById(userId);
        if (update.getFullName() != null) {
            user.setFullName(update.getFullName());
        }
        if (update.getEmail() != null) {
            // 检查邮箱是否已被其他用户使用
            User existingUser = userMapper.selectByEmail(update.getEmail());
            if (existingUser != null && !existingUser.getId().equals(userId)) {
                throw new RuntimeException("邮箱已被使用");
            }
            user.setEmail(update.getEmail());
        }
        if (update.getDepartment() != null) {
            user.setDepartment(update.getDepartment());
        }
        if (update.getAvatarUrl() != null) {
            user.setAvatarUrl(update.getAvatarUrl());
        }
        user.setUpdatedAt(LocalDateTime.now());
        
        userMapper.updateById(user);
        
        List<String> roles = userRoleMapper.selectRoleCodesByUserId(userId);
        UserProfile profile = new UserProfile();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setFullName(user.getFullName());
        profile.setDepartment(user.getDepartment());
        profile.setAvatarUrl(user.getAvatarUrl());
        profile.setSchoolId(user.getSchoolId());
        profile.setRoles(roles);
        
        return profile;
    }
    
    @Transactional
    public void changePassword(HttpServletRequest request, String oldPassword, String newPassword) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        User user = userMapper.selectById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("原密码不正确");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

