package com.edushareqa.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionDetail {
    private Long id;
    private Long courseId;
    private Long studentId;
    private String studentName;
    private String title;
    private String content;
    private String status;
    private Integer answerCount;
    private String createdAt;
    private List<QuestionAttachmentDTO> attachments;
    private List<AnswerDetail> answers;
}

