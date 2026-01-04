package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.entity.Answer;
import com.edushareqa.entity.Question;
import com.edushareqa.service.AnswerService;
import com.edushareqa.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    @Autowired
    private QuestionService questionService;
    
    @Autowired
    private AnswerService answerService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/questions")
    public ApiResponse<PagedResponse<Question>> getAllQuestions(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PagedResponse<Question> result = questionService.getAllQuestions(courseId, status, keyword, teacherId, page, pageSize);
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

    @PutMapping("/questions/{id}")
    public ApiResponse<Question> updateQuestion(@PathVariable Long id,
                                               @RequestParam("metadata") String metadataJson,
                                               @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) throws JsonProcessingException {
        Map<String, Object> body = objectMapper.readValue(metadataJson, new TypeReference<Map<String, Object>>() {});
        Long courseId = body.get("courseId") != null ? Long.valueOf(body.get("courseId").toString()) : null;
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        Question updatedQuestion = questionService.adminUpdateQuestion(id, courseId, title, content, attachments);
        return ApiResponse.success(updatedQuestion);
    }

    @PutMapping("/answers/{id}")
    public ApiResponse<Answer> updateAnswer(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        Answer updatedAnswer = answerService.adminUpdateAnswer(id, content);
        return ApiResponse.success(updatedAnswer);
    }
}
