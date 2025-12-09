package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
    
    @Select("SELECT COUNT(*) FROM notifications WHERE recipient_id = #{userId} AND is_read = 0 AND type = 'QUESTION_REPLIED'")
    Long countUnreadAnswers(Long userId);
    
    @Select("SELECT COUNT(*) FROM notifications WHERE recipient_id = #{userId} AND is_read = 0 AND type = 'NEW_QUESTION'")
    Long countUnreadQuestions(Long userId);
}

