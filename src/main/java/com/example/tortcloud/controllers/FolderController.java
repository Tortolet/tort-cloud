package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.FolderDeleteRootDir;
import com.example.tortcloud.exceptions.FolderNotFound;
import com.example.tortcloud.exceptions.InvalidUser;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FoldersRepo;
import com.example.tortcloud.services.FolderService;
import com.example.tortcloud.services.UserService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @Autowired
    private FoldersRepo foldersRepo;

    @Autowired
    private UserService userService;

    @PostMapping("/create_folder")
    public ResponseEntity<Folders> createFolder(@RequestHeader(required = false) Long folderId, @RequestBody Folders folders) {
        return folderService.addFolder(folderId, folders);
    }

    @GetMapping("/get_folders")
    public ResponseEntity<List<Folders>> getAllFolders() {
        return ResponseEntity.ok().body(folderService.allFolders());
    }

    @DeleteMapping("/delete_folder")
    public ResponseEntity<String> deleteFolder(@RequestHeader Long folderId){
        Users users = userService.getUserFromAuth();

        Folders folders = folderService.findFolderById(folderId);
        if(folders.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if(!folders.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя удалять папки других пользователей");
        }

        if(folders.isRoot()) {
            throw new FolderDeleteRootDir("Нельзя удалить корневую папку");
        }

        try {
            FileUtils.deleteDirectory(Path.of(folders.getPath()).toFile());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        foldersRepo.delete(folders);

        return ResponseEntity.ok().body("Успешно удалено");
    }
}
