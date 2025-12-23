package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.entity.Question;
import com.edushareqa.service.AnswerService;
import com.edushareqa.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    @Autowired
    private QuestionService questionService;
    
    @Autowired
    private AnswerService answerService;

    @GetMapping("/questions")
    public ApiResponse<PagedResponse<Question>> getAllQuestions(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<Question> result = questionService.getAllQuestions(courseId, status, keyword, page, pageSize);
        return ApiResponse.success(result);
    }

    @DeleteMapping("/questions/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id) {
        questionService.adminDeleteQuestion(id);
        return ApiResponse.success(null);
    }
    
    @DeleteMapping("/answers/{id}")
    public ApiResponse<Void> deleteAnswer(@PathVariable Long id) {
        answerService.adminDeleteAnswer(id);
        return ApiResponse.success(null);
    }
}
