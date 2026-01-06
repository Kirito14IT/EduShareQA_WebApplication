package com.edushareqa;

import com.edushareqa.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testSendPasswordResetEmail() {
        // 替换为实际的测试邮箱
        String testEmail = "test@example.com";

        try {
            emailService.sendPasswordResetCode(testEmail, "123456");
            System.out.println("邮件发送成功！请检查邮箱：" + testEmail);
        } catch (Exception e) {
            System.err.println("邮件发送失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}
