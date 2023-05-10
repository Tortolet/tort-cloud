package com.example.tortcloud.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    private static final String PATH = System.getProperty("user.dir") + "/upload";
    private static final String AVATARS = System.getProperty("user.dir") + "/avatars";
    public static final String ZIP = System.getProperty("user.dir") + "/zip";

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/login").setViewName("login");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:///" + PATH + "/");

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:///" + AVATARS + "/");

        registry.addResourceHandler("/zip/**")
                .addResourceLocations("file:///" + ZIP + "/");
    }

}
