package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.Teacher;
import com.edushareqa.dto.TeacherCreate;
import com.edushareqa.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/teachers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping
    public ApiResponse<PagedResponse<Teacher>> getTeachers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<Teacher> result = teacherService.getTeachers(keyword, department, page, pageSize);
        return ApiResponse.success(result);
    }

    @PostMapping
    public ApiResponse<Teacher> createTeacher(@RequestBody TeacherCreate create) {
        Teacher teacher = teacherService.createTeacher(create);
        return ApiResponse.success(teacher);
    }

    @PutMapping("/{id}")
    public ApiResponse<Teacher> updateTeacher(@PathVariable Long id, @RequestBody TeacherCreate update) {
        Teacher teacher = teacherService.updateTeacher(id, update);
        return ApiResponse.success(teacher);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.success(null);
    }
    
    @PostMapping("/{id}/courses")
    public ApiResponse<Void> setTeacherCourses(@PathVariable Long id, @RequestBody com.edushareqa.dto.TeacherCourseAssignment payload) {
        List<Long> courseIds = payload.getCourseIds();
        teacherService.setTeacherCourses(id, courseIds);
        return ApiResponse.success(null);
    }
}
