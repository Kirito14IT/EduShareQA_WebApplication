package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.CourseCreate;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.entity.Course;
import com.edushareqa.entity.CourseTeacher;
import com.edushareqa.mapper.CourseMapper;
import com.edushareqa.mapper.CourseTeacherMapper;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    @Autowired
    private CourseMapper courseMapper;
    
    @Autowired
    private CourseTeacherMapper courseTeacherMapper;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public PagedResponse<com.edushareqa.dto.Course> getCourses(String keyword, String faculty,
                                                               Integer page, Integer pageSize) {
        Page<Course> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(Course::getName, keyword)
                    .or().like(Course::getCode, keyword));
        }
        if (faculty != null && !faculty.trim().isEmpty()) {
            wrapper.eq(Course::getFaculty, faculty);
        }
        
        wrapper.orderByDesc(Course::getCreatedAt);
        
        Page<Course> result = courseMapper.selectPage(pageObj, wrapper);
        
        List<com.edushareqa.dto.Course> items = result.getRecords().stream()
                .map(this::toCourse)
                .collect(Collectors.toList());
        
        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }
    
    @Transactional
    public com.edushareqa.dto.Course createCourse(HttpServletRequest request, CourseCreate create) {
        String token = getTokenFromRequest(request);
        Long adminId = jwtUtil.getUserIdFromToken(token);
        
        Course course = new Course();
        course.setCode(create.getCode());
        course.setName(create.getName());
        course.setDescription(create.getDescription());
        course.setFaculty(create.getFaculty());
        course.setCreatedBy(adminId);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        
        courseMapper.insert(course);
        
        // 分配教师
        if (create.getTeacherIds() != null && !create.getTeacherIds().isEmpty()) {
            for (Long teacherId : create.getTeacherIds()) {
                CourseTeacher ct = new CourseTeacher();
                ct.setCourseId(course.getId());
                ct.setTeacherId(teacherId);
                ct.setAssignedAt(LocalDateTime.now());
                courseTeacherMapper.insert(ct);
            }
        }
        
        return toCourse(course);
    }
    
    @Transactional
    public com.edushareqa.dto.Course updateCourse(Long id, CourseCreate update) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        
        course.setCode(update.getCode());
        course.setName(update.getName());
        course.setDescription(update.getDescription());
        course.setFaculty(update.getFaculty());
        course.setUpdatedAt(LocalDateTime.now());
        
        courseMapper.updateById(course);
        
        // 更新教师分配
        if (update.getTeacherIds() != null) {
            // 删除旧的分配
            courseTeacherMapper.delete(new LambdaQueryWrapper<CourseTeacher>()
                    .eq(CourseTeacher::getCourseId, id));
            
            // 添加新的分配
            if (!update.getTeacherIds().isEmpty()) {
                for (Long teacherId : update.getTeacherIds()) {
                    CourseTeacher ct = new CourseTeacher();
                    ct.setCourseId(id);
                    ct.setTeacherId(teacherId);
                    ct.setAssignedAt(LocalDateTime.now());
                    courseTeacherMapper.insert(ct);
                }
            }
        }
        
        return toCourse(course);
    }
    
    @Transactional
    public void deleteCourse(Long id) {
        courseMapper.deleteById(id);
    }
    
    private com.edushareqa.dto.Course toCourse(Course entity) {
        com.edushareqa.dto.Course course = new com.edushareqa.dto.Course();
        course.setId(entity.getId());
        course.setCode(entity.getCode());
        course.setName(entity.getName());
        course.setDescription(entity.getDescription());
        course.setFaculty(entity.getFaculty());
        course.setCreatedAt(entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString());
        
        List<Long> teacherIds = courseTeacherMapper.selectTeacherIdsByCourseId(entity.getId());
        course.setTeacherIds(teacherIds);
        
        return course;
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

