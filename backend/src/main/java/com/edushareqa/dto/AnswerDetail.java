package com.edushareqa.dto;

import lombok.Data;

import java.util.List;

@Data
public class AnswerDetail {
    private Long id;
    private Long questionId;
    private Long teacherId;
    private String teacherName;
    private String content;
    private String createdAt;
    private String updatedAt;
    private List<AnswerAttachmentDTO> attachments;
}

