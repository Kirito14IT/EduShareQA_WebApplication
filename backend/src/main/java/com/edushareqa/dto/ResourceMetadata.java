package com.edushareqa.dto;

import lombok.Data;

@Data
public class ResourceMetadata {
    private String title;
    private String summary;
    private Long courseId;
    private String visibility; // PUBLIC, COURSE_ONLY
}

