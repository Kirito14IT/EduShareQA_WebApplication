package com.edushareqa.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserProfile {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String avatarUrl;
    private String schoolId;
    private List<String> roles;
}

