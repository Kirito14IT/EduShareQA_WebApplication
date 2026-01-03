package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.TeacherDashboardStats;
import com.edushareqa.service.AnswerService;
import com.edushareqa.service.QuestionService;
import com.edushareqa.service.ResourceService;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
@RequestMapping("/teacher/dashboard")
public class TeacherDashboardController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/stats")
    public ApiResponse<TeacherDashboardStats> getStats(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long teacherId = jwtUtil.getUserIdFromToken(token);

        TeacherDashboardStats stats = new TeacherDashboardStats();
        
        // 待回答问题数量 (Pending Questions)
        Long pendingQuestions = questionService.countPendingQuestions(teacherId);
        stats.setPendingQuestions(pendingQuestions);

        // 已发布资源数量 (Total Resources)
        Long totalResources = resourceService.countMyResources(teacherId);
        stats.setTotalResources(totalResources);

        // 已回答问题数量 (Total Answers)
        Long totalAnswers = answerService.countMyAnswers(teacherId);
        stats.setTotalAnswers(totalAnswers);
        
        // 近期活动 (Recent Activity) - 目前设为空列表，后续可扩展
        stats.setRecentActivity(new ArrayList<>());

        return ApiResponse.success(stats);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
