package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class Teacher {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String title;
    private String bio;
    private List<Long> courseIds;
    private List<String> courseNames;
    private String status;
    private String createdAt;
}
