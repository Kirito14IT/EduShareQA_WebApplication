package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.CourseTeacher;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CourseTeacherMapper extends BaseMapper<CourseTeacher> {
    
    @Select("SELECT course_id FROM course_teacher WHERE teacher_id = #{teacherId}")
    List<Long> selectCourseIdsByTeacherId(Long teacherId);
    
    @Select("SELECT teacher_id FROM course_teacher WHERE course_id = #{courseId}")
    List<Long> selectTeacherIdsByCourseId(Long courseId);
}

