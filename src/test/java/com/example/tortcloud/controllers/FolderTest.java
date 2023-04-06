package com.example.tortcloud.controllers;

import com.example.tortcloud.models.Folders;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.annotation.Rollback;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class FolderTest {

    @Autowired
    private FolderController folderController;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Test
    @Rollback(false)
    void createFolderTest() {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Create folder into root dir
        Folders folder = new Folders();
        folder.setName("Test");
        assertTrue(Objects.nonNull(folderController.createFolder(null, folder)));
        System.out.println("Папка была успешно загружена id: " + folder.getId());
    }

    @Test
    void getFolderByIdTest() {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Check folder with id
        Long id = 28L;
        assertTrue(Objects.nonNull(folderController.getFolderById(id)));
        System.out.println("Папка с id:" + id + " был успешно найден");
    }

    @Test
    @Rollback(false)
    void deleteFolderTest() {
        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken("tort", "123");

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(authRequest);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // Delete folder with id
        Long id = 32L;
        assertEquals(ResponseEntity.ok().body("Успешно удалено"), folderController.deleteFolder(id));
        System.out.println("Файл был успешно загружен в папку под id: " + id + " был успешно загружен");
    }
}