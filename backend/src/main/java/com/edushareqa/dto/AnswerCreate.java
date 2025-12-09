package com.edushareqa.dto;

import lombok.Data;

@Data
public class AnswerCreate {
    private Long questionId;
    private String content;
}

