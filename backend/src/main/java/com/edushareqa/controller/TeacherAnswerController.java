package com.edushareqa.controller;

import com.edushareqa.common.ApiResponse;
import com.edushareqa.dto.AnswerCreate;
import com.edushareqa.dto.AnswerDetail;
import com.edushareqa.service.AnswerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/teacher/answers")
public class TeacherAnswerController {
    
    @Autowired
    private AnswerService answerService;
    
    @PostMapping
    public ApiResponse<AnswerDetail> createAnswer(
            @RequestParam("metadata") String metadata,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments,
            HttpServletRequest request) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            AnswerCreate meta = mapper.readValue(metadata, AnswerCreate.class);
            AnswerDetail answer = answerService.createAnswer(
                    request, meta.getQuestionId(), meta.getContent(),
                    attachments != null ? attachments : new ArrayList<>());
            return ApiResponse.success(answer);
        } catch (Exception e) {
            throw new RuntimeException("创建回答失败: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ApiResponse<AnswerDetail> updateAnswer(@PathVariable Long id, @RequestBody String content, HttpServletRequest request) {
        AnswerDetail answer = answerService.updateAnswer(request, id, content);
        return ApiResponse.success(answer);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAnswer(@PathVariable Long id, HttpServletRequest request) {
        answerService.deleteAnswer(request, id);
        return ApiResponse.success(null);
    }
}

