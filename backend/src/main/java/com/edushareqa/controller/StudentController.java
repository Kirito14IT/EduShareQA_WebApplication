package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.Teacher;
import com.edushareqa.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/teachers")
    public ApiResponse<PagedResponse<Teacher>> getTeachers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "100") Integer pageSize) {
        PagedResponse<Teacher> result = teacherService.getTeachers(keyword, department, page, pageSize);
        return ApiResponse.success(result);
    }
}
