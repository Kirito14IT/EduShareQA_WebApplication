package com.edushareqa.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.edushareqa.dto.AnswerDetail;
import com.edushareqa.dto.PagedResponse;
import com.edushareqa.dto.QuestionDetail;
import com.edushareqa.dto.TeacherQuestion;
import com.edushareqa.entity.Answer;
import com.edushareqa.entity.AnswerAttachment;
import com.edushareqa.entity.Course;
import com.edushareqa.entity.Question;
import com.edushareqa.entity.QuestionAttachment;
import com.edushareqa.entity.User;
import com.edushareqa.mapper.AnswerAttachmentMapper;
import com.edushareqa.mapper.AnswerMapper;
import com.edushareqa.mapper.CourseMapper;
import com.edushareqa.mapper.CourseTeacherMapper;
import com.edushareqa.mapper.QuestionAttachmentMapper;
import com.edushareqa.mapper.QuestionMapper;
import com.edushareqa.mapper.UserMapper;
import com.edushareqa.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    @Autowired
    private QuestionMapper questionMapper;
    
    @Autowired
    private QuestionAttachmentMapper attachmentMapper;
    
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private CourseTeacherMapper courseTeacherMapper;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AnswerMapper answerMapper;

    @Autowired
    private AnswerAttachmentMapper answerAttachmentMapper;
    
    @Transactional
    public Question createQuestion(HttpServletRequest request, Long courseId,
                                  String title, String content, List<MultipartFile> attachments) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Question question = new Question();
        question.setCourseId(courseId);
        question.setStudentId(userId);
        question.setTitle(title);
        question.setContent(content);
        question.setStatus("OPEN");
        question.setAnswerCount(0);
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        
        questionMapper.insert(question);
        
        // 保存附件
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                if (!file.isEmpty()) {
                    try {
                        String filePath = fileService.saveQuestionAttachment(file);
                        QuestionAttachment attachment = new QuestionAttachment();
                        attachment.setQuestionId(question.getId());
                        attachment.setFilePath(filePath);
                        attachment.setFileType(file.getContentType());
                        attachment.setFileSize(file.getSize());
                        attachment.setCreatedAt(LocalDateTime.now());
                        attachmentMapper.insert(attachment);
                    } catch (Exception e) {
                        throw new RuntimeException("附件上传失败: " + e.getMessage());
                    }
                }
            }
        }
        
        return question;
    }
    
    public PagedResponse<Question> getQuestions(Long courseId, String status, String keyword, Long teacherId,
                                               Integer page, Integer pageSize, HttpServletRequest request) {
        Page<Question> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();

        // 如果有teacherId参数，搜索该教师的所有课程的问题；否则只返回当前学生的问题
        if (teacherId != null) {
            // 查找该教师的所有课程ID
            List<Long> courseIds = courseTeacherMapper.selectCourseIdsByTeacherId(teacherId);
            if (!courseIds.isEmpty()) {
                wrapper.in(Question::getCourseId, courseIds);
            } else {
                // 如果教师没有课程，返回空结果
                return PagedResponse.of(new ArrayList<>(), page, pageSize, 0L);
            }
        } else {
            // 没有teacherId时，只返回当前学生的问题
            String token = getTokenFromRequest(request);
            Long userId = jwtUtil.getUserIdFromToken(token);
            wrapper.eq(Question::getStudentId, userId);
        }

        if (courseId != null) {
            wrapper.eq(Question::getCourseId, courseId);
        }
        if (status != null) {
            wrapper.eq(Question::getStatus, status);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(Question::getTitle, keyword)
                    .or().like(Question::getContent, keyword));
        }

        wrapper.orderByDesc(Question::getCreatedAt);

        Page<Question> result = questionMapper.selectPage(pageObj, wrapper);
        return PagedResponse.of(result.getRecords(), page, pageSize, result.getTotal());
    }

    @Transactional
    public Question updateQuestion(HttpServletRequest request, Long id, Long courseId, String title, String content) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        if (!question.getStudentId().equals(userId)) {
            throw new RuntimeException("无权修改此问题");
        }
        
        if (!"OPEN".equals(question.getStatus())) {
            throw new RuntimeException("问题已被回答或关闭，无法修改");
        }
        
        if (courseId != null) {
            question.setCourseId(courseId);
        }
        if (title != null && !title.trim().isEmpty()) {
            question.setTitle(title);
        }
        if (content != null && !content.trim().isEmpty()) {
            question.setContent(content);
        }
        question.setUpdatedAt(LocalDateTime.now());
        
        questionMapper.updateById(question);
        return question;
    }

    public PagedResponse<Question> getAllQuestions(Long courseId, String status, String keyword, Long teacherId,
                                                  Integer page, Integer pageSize) {
        Page<Question> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();

        if (teacherId != null) {
            // 查找该教师的所有课程ID
            List<Long> courseIds = courseTeacherMapper.selectCourseIdsByTeacherId(teacherId);
            if (!courseIds.isEmpty()) {
                wrapper.in(Question::getCourseId, courseIds);
            } else {
                // 如果教师没有课程，返回空结果
                return PagedResponse.of(new ArrayList<>(), page, pageSize, 0L);
            }
        }

        if (courseId != null) {
            wrapper.eq(Question::getCourseId, courseId);
        }
        if (status != null) {
            wrapper.eq(Question::getStatus, status);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(Question::getTitle, keyword)
                    .or().like(Question::getContent, keyword));
        }

        wrapper.orderByDesc(Question::getCreatedAt);

        Page<Question> result = questionMapper.selectPage(pageObj, wrapper);
        return PagedResponse.of(result.getRecords(), page, pageSize, result.getTotal());
    }

    public Long countPendingQuestions(Long teacherId) {
        List<Long> courseIds = courseTeacherMapper.selectCourseIdsByTeacherId(teacherId);
        if (courseIds.isEmpty()) {
            return 0L;
        }
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Question::getCourseId, courseIds);
        wrapper.eq(Question::getStatus, "OPEN");
        return questionMapper.selectCount(wrapper);
    }

    public PagedResponse<TeacherQuestion> getTeacherQuestions(String status, Integer page, Integer pageSize, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long teacherId = jwtUtil.getUserIdFromToken(token);

        // 获取教师教授的课程
        List<Long> courseIds = courseTeacherMapper.selectCourseIdsByTeacherId(teacherId);
        if (courseIds.isEmpty()) {
            return PagedResponse.of(new ArrayList<>(), page, pageSize, 0L);
        }

        Page<Question> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Question::getCourseId, courseIds);

        if (status != null && !status.trim().isEmpty()) {
            wrapper.eq(Question::getStatus, status);
        }

        wrapper.orderByDesc(Question::getCreatedAt);

        Page<Question> result = questionMapper.selectPage(pageObj, wrapper);
        
        // 转换为 TeacherQuestion DTO
        List<TeacherQuestion> items = result.getRecords().stream().map(q -> {
            TeacherQuestion dto = new TeacherQuestion();
            dto.setId(q.getId());
            dto.setCourseId(q.getCourseId());
            dto.setStudentId(q.getStudentId());
            dto.setTitle(q.getTitle());
            dto.setContent(q.getContent());
            dto.setStatus(q.getStatus());
            dto.setAnswerCount(q.getAnswerCount());
            dto.setCreatedAt(q.getCreatedAt());
            dto.setUpdatedAt(q.getUpdatedAt());
            
            User student = userMapper.selectById(q.getStudentId());
            if (student != null) {
                dto.setStudentName(student.getFullName());
            }
            
            Course course = courseMapper.selectById(q.getCourseId());
            if (course != null) {
                dto.setCourseName(course.getName());
            }
            
            return dto;
        }).collect(Collectors.toList());

        return PagedResponse.of(items, page, pageSize, result.getTotal());
    }
    
    public QuestionDetail getTeacherQuestionById(Long id, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        Long teacherId = jwtUtil.getUserIdFromToken(token);

        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }

        // 检查权限：教师是否教授该课程
        List<Long> courseIds = courseTeacherMapper.selectCourseIdsByTeacherId(teacherId);
        if (!courseIds.contains(question.getCourseId())) {
            throw new RuntimeException("您没有权限查看此问题（非本课程教师）");
        }

        return getQuestionById(id);
    }

    public QuestionDetail getQuestionById(Long id) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        QuestionDetail detail = new QuestionDetail();
        detail.setId(question.getId());
        detail.setCourseId(question.getCourseId());
        detail.setStudentId(question.getStudentId());
        detail.setTitle(question.getTitle());
        detail.setContent(question.getContent());
        detail.setStatus(question.getStatus());
        detail.setAnswerCount(question.getAnswerCount());
        detail.setCreatedAt(question.getCreatedAt().toString());
        
        User student = userMapper.selectById(question.getStudentId());
        if (student != null) {
            detail.setStudentName(student.getFullName());
        }
        
        // 加载附件
        LambdaQueryWrapper<QuestionAttachment> attachmentWrapper = new LambdaQueryWrapper<>();
        attachmentWrapper.eq(QuestionAttachment::getQuestionId, id);
        List<QuestionAttachment> attachments = attachmentMapper.selectList(attachmentWrapper);
        detail.setAttachments(attachments.stream()
                .map(a -> {
                    com.edushareqa.dto.QuestionAttachmentDTO dto = new com.edushareqa.dto.QuestionAttachmentDTO();
                    dto.setId(a.getId());
                    dto.setFilePath(a.getFilePath());
                    dto.setFileType(a.getFileType());
                    return dto;
                })
                .collect(Collectors.toList()));
        
        // 加载回答
        LambdaQueryWrapper<Answer> answerWrapper = new LambdaQueryWrapper<>();
        answerWrapper.eq(Answer::getQuestionId, id);
        // 只显示已发布的回答
        answerWrapper.eq(Answer::getIsPublished, true);
        answerWrapper.orderByAsc(Answer::getCreatedAt);
        List<Answer> answers = answerMapper.selectList(answerWrapper);
        
        detail.setAnswers(answers.stream().map(this::toAnswerDetail).collect(Collectors.toList()));

        return detail;
    }

    private AnswerDetail toAnswerDetail(Answer answer) {
        AnswerDetail detail = new AnswerDetail();
        detail.setId(answer.getId());
        detail.setQuestionId(answer.getQuestionId());
        detail.setTeacherId(answer.getTeacherId());
        detail.setContent(answer.getContent());
        detail.setCreatedAt(answer.getCreatedAt().toString());
        
        User teacher = userMapper.selectById(answer.getTeacherId());
        if (teacher != null) {
            detail.setTeacherName(teacher.getFullName());
        }
        
        // 加载附件
        LambdaQueryWrapper<AnswerAttachment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AnswerAttachment::getAnswerId, answer.getId());
        List<AnswerAttachment> attachments = answerAttachmentMapper.selectList(wrapper);
        detail.setAttachments(attachments.stream()
                .map(a -> {
                    com.edushareqa.dto.AnswerAttachmentDTO dto = new com.edushareqa.dto.AnswerAttachmentDTO();
                    dto.setId(a.getId());
                    dto.setFilePath(a.getFilePath());
                    dto.setFileType(a.getFileType());
                    return dto;
                })
                .collect(Collectors.toList()));
        
        return detail;
    }
    
    @Transactional
    public void deleteQuestion(HttpServletRequest request, Long id) {
        String token = getTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        
        if (!question.getStudentId().equals(userId)) {
            throw new RuntimeException("无权删除此问题");
        }
        
        questionMapper.deleteById(id);
    }

    @Transactional
    public void adminDeleteQuestion(Long id) {
        questionMapper.deleteById(id);
    }

    @Transactional
    public Question adminUpdateQuestion(Long id, Long courseId, String title, String content, List<MultipartFile> attachments) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }

        if (courseId != null) {
            question.setCourseId(courseId);
        }
        if (title != null && !title.trim().isEmpty()) {
            question.setTitle(title);
        }
        if (content != null && !content.trim().isEmpty()) {
            question.setContent(content);
        }
        
        // Handle attachments update: if new attachments provided, delete old ones and add new ones
        if (attachments != null && !attachments.isEmpty()) {
            // Delete old attachments
            LambdaQueryWrapper<QuestionAttachment> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(QuestionAttachment::getQuestionId, id);
            attachmentMapper.delete(wrapper);
            
            // Add new attachments
            for (MultipartFile file : attachments) {
                if (!file.isEmpty()) {
                    try {
                        String filePath = fileService.saveQuestionAttachment(file);
                        QuestionAttachment attachment = new QuestionAttachment();
                        attachment.setQuestionId(question.getId());
                        attachment.setFilePath(filePath);
                        attachment.setFileType(file.getContentType());
                        attachment.setFileSize(file.getSize());
                        attachment.setCreatedAt(LocalDateTime.now());
                        attachmentMapper.insert(attachment);
                    } catch (Exception e) {
                        throw new RuntimeException("附件上传失败: " + e.getMessage());
                    }
                }
            }
        }
        
        question.setUpdatedAt(LocalDateTime.now());

        questionMapper.updateById(question);
        return question;
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

