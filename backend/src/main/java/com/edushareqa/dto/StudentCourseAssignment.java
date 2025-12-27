package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class StudentCourseAssignment {
    private List<Long> courseIds;
}
