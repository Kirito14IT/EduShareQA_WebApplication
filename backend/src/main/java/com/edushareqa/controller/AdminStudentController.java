package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.Student;
import com.edushareqa.dto.StudentCourseAssignment;
import com.edushareqa.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/students")
public class AdminStudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ApiResponse<PagedResponse<Student>> getStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<Student> result = studentService.getStudents(keyword, department, page, pageSize);
        return ApiResponse.success(result);
    }

    @PostMapping("/{id}/courses")
    public ApiResponse<Void> setStudentCourses(
            @PathVariable Long id,
            @RequestBody StudentCourseAssignment assignment) {
        studentService.setStudentCourses(id, assignment.getCourseIds());
        return ApiResponse.success(null);
    }
}
