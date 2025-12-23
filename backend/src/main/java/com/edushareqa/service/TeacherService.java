package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.Teacher;
import com.edushareqa.dto.TeacherCreate;
import com.edushareqa.entity.*;
import com.edushareqa.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private CourseTeacherMapper courseTeacherMapper;
    
    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Teacher createTeacher(TeacherCreate create) {
        // Validate input
        if (create.getUsername() == null || create.getUsername().trim().isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (create.getEmail() == null || create.getEmail().trim().isEmpty()) {
            throw new RuntimeException("邮箱不能为空");
        }
        if (create.getFullName() == null || create.getFullName().trim().isEmpty()) {
            throw new RuntimeException("姓名不能为空");
        }

        // Check if username or email exists
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getUsername, create.getUsername())) > 0) {
            throw new RuntimeException("用户名已存在");
        }
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, create.getEmail())) > 0) {
            throw new RuntimeException("邮箱已存在");
        }

        User user = new User();
        user.setUsername(create.getUsername());
        user.setEmail(create.getEmail());
        user.setFullName(create.getFullName());
        // Default password if not provided, though frontend should provide it now
        String rawPassword = (create.getPassword() != null && !create.getPassword().isEmpty()) ? create.getPassword() : "123456";
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setDepartment(create.getDepartment());
        user.setTitle(create.getTitle());
        user.setBio(create.getBio());
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userMapper.insert(user);

        // Assign TEACHER role
        Role teacherRole = roleMapper.selectOne(new LambdaQueryWrapper<Role>().eq(Role::getCode, "TEACHER"));
        if (teacherRole == null) {
            throw new RuntimeException("TEACHER role not found");
        }
        UserRole userRole = new UserRole();
        userRole.setUserId(user.getId());
        userRole.setRoleId(teacherRole.getId());
        userRole.setCreatedAt(LocalDateTime.now());
        userRoleMapper.insert(userRole);

        // Assign Courses
        assignCourses(user.getId(), create.getCourseIds());

        return toTeacher(user);
    }

    @Transactional
    public Teacher updateTeacher(Long id, TeacherCreate update) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("教师不存在");
        }

        user.setEmail(update.getEmail());
        user.setFullName(update.getFullName());
        user.setDepartment(update.getDepartment());
        user.setTitle(update.getTitle());
        user.setBio(update.getBio());
        
        if (update.getPassword() != null && !update.getPassword().isEmpty()) {
             user.setPasswordHash(passwordEncoder.encode(update.getPassword()));
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        if (update.getCourseIds() != null) {
            assignCourses(id, update.getCourseIds());
        }

        return toTeacher(user);
    }
    
    @Transactional
    public void setTeacherCourses(Long teacherId, List<Long> courseIds) {
        assignCourses(teacherId, courseIds);
    }

    private void assignCourses(Long teacherId, List<Long> courseIds) {
        // Delete existing
        courseTeacherMapper.delete(new LambdaQueryWrapper<CourseTeacher>().eq(CourseTeacher::getTeacherId, teacherId));

        if (courseIds != null && !courseIds.isEmpty()) {
            for (Long courseId : courseIds) {
                CourseTeacher ct = new CourseTeacher();
                ct.setTeacherId(teacherId);
                ct.setCourseId(courseId);
                ct.setAssignedAt(LocalDateTime.now());
                courseTeacherMapper.insert(ct);
            }
        }
    }

    @Transactional
    public void deleteTeacher(Long id) {
        // Deleting user will cascade delete user_roles and course_teachers if FK set correctly.
        // But logical delete is usually preferred. Here we hard delete as per requirement "deleteTeacher".
        userMapper.deleteById(id);
    }

    public PagedResponse<Teacher> getTeachers(String keyword, String department, Integer page, Integer pageSize) {
        // 1. Get Teacher Role ID
        Role teacherRole = roleMapper.selectOne(new LambdaQueryWrapper<Role>().eq(Role::getCode, "TEACHER"));
        if (teacherRole == null) return new PagedResponse<>();

        // 2. Get User IDs with Teacher Role
        List<UserRole> userRoles = userRoleMapper.selectList(new LambdaQueryWrapper<UserRole>().eq(UserRole::getRoleId, teacherRole.getId()));
        List<Long> teacherUserIds = userRoles.stream().map(UserRole::getUserId).collect(Collectors.toList());

        if (teacherUserIds.isEmpty()) {
            return PagedResponse.of(new ArrayList<>(), page, pageSize, 0L);
        }

        // 3. Query Users
        Page<User> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(User::getId, teacherUserIds);
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(User::getFullName, keyword)
                    .or().like(User::getUsername, keyword)
                    .or().like(User::getEmail, keyword));
        }
        if (department != null && !department.trim().isEmpty()) {
            wrapper.eq(User::getDepartment, department);
        }
        
        wrapper.orderByDesc(User::getCreatedAt);

        Page<User> result = userMapper.selectPage(pageObj, wrapper);

        List<Teacher> items = result.getRecords().stream()
                .map(this::toTeacher)
                .collect(Collectors.toList());

        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }

    private Teacher toTeacher(User user) {
        Teacher dto = new Teacher();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setDepartment(user.getDepartment());
        dto.setTitle(user.getTitle());
        dto.setBio(user.getBio());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt().toString());

        // Get Courses
        List<Long> courseIds = courseTeacherMapper.selectList(
                new LambdaQueryWrapper<CourseTeacher>().eq(CourseTeacher::getTeacherId, user.getId())
        ).stream().map(CourseTeacher::getCourseId).collect(Collectors.toList());
        
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
