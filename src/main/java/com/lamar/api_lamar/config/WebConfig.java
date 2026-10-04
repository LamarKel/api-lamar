package com.lamar.api_lamar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    // Sirve los archivos subidos en /uploads/**
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry r) {
        String path = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        r.addResourceHandler("/uploads/**").addResourceLocations(path);
    }

    @Override
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/**").allowedOrigins("*").allowedMethods("*").allowedHeaders("*");
    }
}
