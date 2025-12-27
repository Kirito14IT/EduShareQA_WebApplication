package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.Student;
import com.edushareqa.entity.Course;
import com.edushareqa.entity.CourseStudent;
import com.edushareqa.entity.Role;
import com.edushareqa.entity.User;
import com.edushareqa.entity.UserRole;
import com.edushareqa.mapper.CourseMapper;
import com.edushareqa.mapper.CourseStudentMapper;
import com.edushareqa.mapper.RoleMapper;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.mapper.UserRoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private CourseStudentMapper courseStudentMapper;
    
    @Autowired
    private CourseMapper courseMapper;

    public PagedResponse<Student> getStudents(String keyword, String department, Integer page, Integer pageSize) {
        // 1. Get Student Role ID
        Role studentRole = roleMapper.selectOne(new LambdaQueryWrapper<Role>().eq(Role::getCode, "STUDENT"));
        if (studentRole == null) return new PagedResponse<>();

        // 2. Get User IDs with Student Role
        List<UserRole> userRoles = userRoleMapper.selectList(new LambdaQueryWrapper<UserRole>().eq(UserRole::getRoleId, studentRole.getId()));
        List<Long> studentUserIds = userRoles.stream().map(UserRole::getUserId).collect(Collectors.toList());

        if (studentUserIds.isEmpty()) {
            return PagedResponse.of(new ArrayList<>(), page, pageSize, 0L);
        }

        // 3. Query Users
        Page<User> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(User::getId, studentUserIds);
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(User::getFullName, keyword)
                    .or().like(User::getUsername, keyword)
                    .or().like(User::getEmail, keyword));
        }
        if (department != null && !department.trim().isEmpty()) {
            wrapper.like(User::getDepartment, department);
        }
        
        wrapper.orderByDesc(User::getCreatedAt);

        Page<User> result = userMapper.selectPage(pageObj, wrapper);

        List<Student> items = result.getRecords().stream()
                .map(this::toStudent)
                .collect(Collectors.toList());

        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }
    
    @Transactional
    public void setStudentCourses(Long studentId, List<Long> courseIds) {
        // Delete existing
        courseStudentMapper.delete(new LambdaQueryWrapper<CourseStudent>().eq(CourseStudent::getStudentId, studentId));

        if (courseIds != null && !courseIds.isEmpty()) {
            for (Long courseId : courseIds) {
                CourseStudent cs = new CourseStudent();
                cs.setStudentId(studentId);
                cs.setCourseId(courseId);
                cs.setAssignedAt(LocalDateTime.now());
                courseStudentMapper.insert(cs);
            }
        }
    }

    private Student toStudent(User user) {
        Student dto = new Student();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setDepartment(user.getDepartment());
        dto.setSchoolId(user.getSchoolId());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt().toString());

        // Get Courses
        List<Long> courseIds = courseStudentMapper.selectList(
                new LambdaQueryWrapper<CourseStudent>().eq(CourseStudent::getStudentId, user.getId())
        ).stream().map(CourseStudent::getCourseId).collect(Collectors.toList());
        
        dto.setCourseIds(courseIds);
        
        if (!courseIds.isEmpty()) {
            List<String> courseNames = courseMapper.selectBatchIds(courseIds).stream()
                    .map(Course::getName)
                    .collect(Collectors.toList());
            dto.setCourseNames(courseNames);
        }

        return dto;
    }
}
