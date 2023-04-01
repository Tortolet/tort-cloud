package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.FolderNotFound;
import com.example.tortcloud.exceptions.InvalidUser;
import com.example.tortcloud.models.Files;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FilesRepo;
import com.example.tortcloud.services.FilesService;
import com.example.tortcloud.services.FolderService;
import com.example.tortcloud.services.UserService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api")
public class FilesController {

    @Autowired
    private FilesService filesService;

    @Autowired
    private FilesRepo filesRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private FolderService folderService;


    @PostMapping("/add_files")
    public ResponseEntity<String> addFiles(@RequestBody MultipartFile[] files, @RequestHeader Long folderId) {
        Users users = userService.getUserFromAuth();

        Folders folders = folderService.findFolderById(folderId);
        if(!folders.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя добавлять файлы другим пользователям");
        }

        if(folders.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        for (MultipartFile file: files) {
            com.example.tortcloud.models.Files files1 = new com.example.tortcloud.models.Files();
            Path fileNameAndPath = Paths.get(folders.getPath(), file.getOriginalFilename());

            files1.setLocation(file.getOriginalFilename());
            files1.setName(file.getName());
            files1.setSize(file.getSize());
            files1.setFormat(file.getContentType());
            files1.setUsers(users);
            files1.setFolder(folders);
            files1.setInTrash(false);
            files1.setBookmark(false);
            files1.setDateCreated(LocalDateTime.now());
            files1.setDateModified(LocalDateTime.now());

            try {
                if(!Objects.requireNonNull(file.getOriginalFilename()).isEmpty())
                    java.nio.file.Files.write(fileNameAndPath, file.getBytes());
                if(!files1.getLocation().isEmpty())
                    filesRepo.save(files1);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok().body("Файлы были успешно загружены");
    }

    @DeleteMapping("/delete_file")
    public ResponseEntity<String> deleteFile(@RequestHeader Long fileId) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(fileId);
        if(file.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя удалять файлы другим пользователям");
        }
        String path = file.getFolder().getPath() + "/" + file.getLocation();
        try {
            FileUtils.delete(Path.of(path).toFile());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        filesRepo.delete(file);

        return ResponseEntity.ok().body("Файл " + file.getLocation() + " был успешно удален");
    }
}
