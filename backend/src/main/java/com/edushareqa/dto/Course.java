package com.edushareqa.dto;

import lombok.Data;

import java.util.List;

@Data
public class Course {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String faculty;
    private List<Long> teacherIds;
    private List<String> teacherNames;
    private String createdAt;
    private String updatedAt;
}

