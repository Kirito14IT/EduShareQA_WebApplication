package com.edushareqa.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.reset-password-subject}")
    private String resetPasswordSubject;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 发送密码重置验证码邮件
     * @param toEmail 收件人邮箱
     * @param verificationCode 验证码
     */
    public void sendPasswordResetCode(String toEmail, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(resetPasswordSubject);
        message.setText(buildResetPasswordEmailContent(verificationCode));

        mailSender.send(message);
    }

    /**
     * 构建密码重置邮件内容
     */
    private String buildResetPasswordEmailContent(String verificationCode) {
        return String.format(
            "亲爱的EduShareQA用户：\n\n" +
            "您正在进行密码重置操作。\n\n" +
            "您的验证码是：%s\n\n" +
            "验证码有效期为15分钟，请及时完成密码重置。\n\n" +
            "如果这不是您本人的操作，请忽略此邮件。\n\n" +
            "EduShareQA团队",
            verificationCode
        );
    }
}
