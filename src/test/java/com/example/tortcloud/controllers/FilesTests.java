package com.example.tortcloud.controllers;

import jakarta.transaction.Transactional;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.annotation.Rollback;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class FilesTests {

    @Autowired
    private FilesController filesController;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Test
    void getFileByIdTest() {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Check file with id
        Long id = 28L;
        assertTrue(Objects.nonNull(filesController.getFileById(id)));
        System.out.println("Файл с id:" + id + " был успешно найден");
    }

    @Test
    @Rollback(false)
    void addFileTest() throws IOException {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        File file = new File("C:\\Users\\ivanm\\Downloads\\IMG_2480.jpg");
        FileInputStream input = new FileInputStream(file);
        MultipartFile[] multipartFile = new MockMultipartFile[]{new MockMultipartFile("IMG_2480.jpg",
                file.getName(), "image/jpeg", IOUtils.toByteArray(input))};

        // Check create file with id
        Long id = 7L;
        assertEquals(ResponseEntity.ok().body("Файлы были успешно загружены"), filesController.addFiles(multipartFile, id));
        System.out.println("Файл был успешно загружен в папку под id: " + id + " был успешно загружен");
    }

    @Test
    @Rollback(false)
    void deleteFileTest() {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Check delete file with id
        Long id = 27L;
        assertTrue(Objects.nonNull(filesController.deleteFile(id)));
        System.out.println("Файл был успешно удален под id: " + id);
    }
}
