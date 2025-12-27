package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.CourseStudent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CourseStudentMapper extends BaseMapper<CourseStudent> {
    
    @Select("SELECT course_id FROM course_student WHERE student_id = #{studentId}")
    List<Long> selectCourseIdsByStudentId(Long studentId);
}
