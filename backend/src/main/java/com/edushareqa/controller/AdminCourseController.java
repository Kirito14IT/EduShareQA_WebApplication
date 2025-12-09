package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.Course;
import com.edushareqa.dto.CourseCreate;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.service.CourseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/courses")
public class AdminCourseController {
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping
    public ApiResponse<PagedResponse<Course>> getCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String faculty,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<Course> result = courseService.getCourses(keyword, faculty, page, pageSize);
        return ApiResponse.success(result);
    }
    
    @PostMapping
    public ApiResponse<Course> createCourse(
            @RequestBody CourseCreate create,
            HttpServletRequest request) {
        Course course = courseService.createCourse(request, create);
        return ApiResponse.success(course);
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ApiResponse.success(null);
    }
}

