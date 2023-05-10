package com.example.tortcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class TortCloudApplication {

    public static final String UPLOAD_DIR = System.getProperty("user.dir") + "/upload";
    public static final String AVATAR_DIR = System.getProperty("user.dir") + "/avatars";
    public static final String ZIP_DIR = System.getProperty("user.dir") + "/zip";

    public static void main(String[] args) {
        new File(UPLOAD_DIR).mkdir();
        new File(AVATAR_DIR).mkdir();
        new File(ZIP_DIR).mkdir();
        SpringApplication.run(TortCloudApplication.class, args);
    }

}
