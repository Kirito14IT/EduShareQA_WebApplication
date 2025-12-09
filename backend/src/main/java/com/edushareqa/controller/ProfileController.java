package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PasswordChange;
import com.edushareqa.dto.ProfileUpdate;
import com.edushareqa.dto.UserProfile;
import com.edushareqa.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
public class ProfileController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ApiResponse<UserProfile> getProfile(HttpServletRequest request) {
        UserProfile profile = userService.getCurrentUserProfile(request);
        return ApiResponse.success(profile);
    }
    
    @PutMapping("/me")
    public ApiResponse<UserProfile> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody ProfileUpdate update) {
        UserProfile profile = userService.updateProfile(request, update);
        return ApiResponse.success(profile);
    }
    
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
            HttpServletRequest request,
            @Valid @RequestBody PasswordChange change) {
        userService.changePassword(request, change.getOldPassword(), change.getNewPassword());
        return ApiResponse.success(null);
    }
}

