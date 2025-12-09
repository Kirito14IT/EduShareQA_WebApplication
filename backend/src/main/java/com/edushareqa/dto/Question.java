package com.edushareqa.dto;

import lombok.Data;

@Data
public class Question {
    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private String status;
    private Integer answerCount;
    private String createdAt;
}

