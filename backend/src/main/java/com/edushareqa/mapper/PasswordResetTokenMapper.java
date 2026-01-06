package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.PasswordResetToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

@Mapper
public interface PasswordResetTokenMapper extends BaseMapper<PasswordResetToken> {

    @Select("SELECT * FROM password_reset_tokens WHERE token = #{token} AND used = 0 AND expires_at > #{now}")
    PasswordResetToken selectValidToken(String token, LocalDateTime now);

    @Update("UPDATE password_reset_tokens SET used = 1 WHERE token = #{token}")
    int markTokenAsUsed(String token);
}
