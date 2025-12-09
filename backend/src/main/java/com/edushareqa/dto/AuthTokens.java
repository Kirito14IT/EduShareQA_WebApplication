package com.edushareqa.dto;

import lombok.Data;

@Data
public class AuthTokens {
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
}

