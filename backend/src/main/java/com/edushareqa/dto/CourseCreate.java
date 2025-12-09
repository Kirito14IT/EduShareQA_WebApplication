package com.edushareqa.dto;

import lombok.Data;

import java.util.List;

@Data
public class CourseCreate {
    private String code;
    private String name;
    private String description;
    private String faculty;
    private List<Long> teacherIds;
}

