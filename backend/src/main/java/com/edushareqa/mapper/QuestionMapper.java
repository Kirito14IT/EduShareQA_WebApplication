package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.Question;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface QuestionMapper extends BaseMapper<Question> {
    
    @Update("UPDATE questions SET answer_count = answer_count + 1 WHERE id = #{questionId}")
    void incrementAnswerCount(Long questionId);
}

