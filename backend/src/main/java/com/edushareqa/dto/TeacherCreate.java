package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class TeacherCreate {
    private String username;
    private String email;
    private String fullName;
    private String password;
    private String department;
    private String title;
    private String bio;
    private List<Long> courseIds;
}
