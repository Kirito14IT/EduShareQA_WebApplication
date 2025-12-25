package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.QuestionDetail;
import com.edushareqa.entity.Question;
import com.edushareqa.service.QuestionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/student/questions")
public class StudentQuestionController {
    
    @Autowired
    private QuestionService questionService;
    
    @GetMapping
    public ApiResponse<PagedResponse<Question>> getQuestions(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        PagedResponse<Question> result = questionService.getQuestions(
                courseId, status, keyword, page, pageSize, request);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<QuestionDetail> getQuestionById(@PathVariable Long id) {
        QuestionDetail question = questionService.getQuestionById(id);
        return ApiResponse.success(question);
    }
    
    @PostMapping
    public ApiResponse<Question> createQuestion(
            @RequestParam("metadata") String metadata,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments,
            HttpServletRequest request) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            com.edushareqa.dto.QuestionCreate meta = mapper.readValue(metadata, com.edushareqa.dto.QuestionCreate.class);
            Question question = questionService.createQuestion(
                    request, meta.getCourseId(), meta.getTitle(), meta.getContent(),
                    attachments != null ? attachments : new ArrayList<>());
            return ApiResponse.success(question);
        } catch (Exception e) {
            throw new RuntimeException("创建问题失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Question> updateQuestion(
            @PathVariable Long id,
            @RequestBody com.edushareqa.dto.QuestionCreate meta,
            HttpServletRequest request) {
        Question question = questionService.updateQuestion(
                request, id, meta.getCourseId(), meta.getTitle(), meta.getContent());
        return ApiResponse.success(question);
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id, HttpServletRequest request) {
        questionService.deleteQuestion(request, id);
        return ApiResponse.success(null);
    }
}

