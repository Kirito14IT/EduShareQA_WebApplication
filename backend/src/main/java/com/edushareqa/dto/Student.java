package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class Student {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String schoolId;
    private String status;
    private String createdAt;
    private List<Long> courseIds;
    private List<String> courseNames;
}
