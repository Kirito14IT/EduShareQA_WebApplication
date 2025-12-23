package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class TeacherCourseAssignment {
    private List<Long> courseIds;
}
