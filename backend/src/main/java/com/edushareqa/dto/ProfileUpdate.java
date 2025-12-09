package com.edushareqa.dto;

import lombok.Data;

@Data
public class ProfileUpdate {
    private String fullName;
    private String email;
    private String department;
    private String avatarUrl;
}

