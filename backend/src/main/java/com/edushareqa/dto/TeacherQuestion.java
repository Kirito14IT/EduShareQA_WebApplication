package com.edushareqa.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeacherQuestion {
    private Long id;
    private Long courseId;
    private String courseName;
    private Long studentId;
    private String studentName;
    private String title;
    private String content;
    private String status;
    private Integer answerCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
