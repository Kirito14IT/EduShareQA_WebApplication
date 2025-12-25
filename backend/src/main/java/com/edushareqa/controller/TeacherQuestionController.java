package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.QuestionDetail;
import com.edushareqa.dto.TeacherQuestion;
import com.edushareqa.service.QuestionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher/questions")
public class TeacherQuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public ApiResponse<PagedResponse<TeacherQuestion>> getQuestions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        PagedResponse<TeacherQuestion> result = questionService.getTeacherQuestions(status, page, pageSize, request);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<QuestionDetail> getQuestionById(@PathVariable Long id, HttpServletRequest request) {
        QuestionDetail question = questionService.getTeacherQuestionById(id, request);
        return ApiResponse.success(question);
    }
}
