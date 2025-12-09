package com.edushareqa.dto;

import lombok.Data;

@Data
public class QuestionCreate {
    private Long courseId;
    private String title;
    private String content;
}

