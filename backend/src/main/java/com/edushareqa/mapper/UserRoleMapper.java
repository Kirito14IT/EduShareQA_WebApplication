package com.edushareqa.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.edushareqa.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserRoleMapper extends BaseMapper<UserRole> {
    
    @Select("SELECT r.code FROM user_roles ur " +
            "INNER JOIN roles r ON ur.role_id = r.id " +
            "WHERE ur.user_id = #{userId}")
    List<String> selectRoleCodesByUserId(Long userId);
}

