package com.edushareqa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 移除静态资源映射，由 FileController 接管文件下载
        // Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        // registry.addResourceHandler("/uploads/**")
        //        .addResourceLocations(uploadPath.toUri().toString() + "/");
    }
}
