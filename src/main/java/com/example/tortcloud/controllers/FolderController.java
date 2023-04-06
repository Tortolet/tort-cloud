package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.FolderDeleteRootDir;
import com.example.tortcloud.exceptions.FolderNotFound;
import com.example.tortcloud.exceptions.InvalidUser;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FoldersRepo;
import com.example.tortcloud.schemas.AddFolderSchema;
import com.example.tortcloud.schemas.CustomResponseErrorSchema;
import com.example.tortcloud.services.FolderService;
import com.example.tortcloud.services.UserService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = AddFolderSchema.class)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Folders.class))),
            @ApiResponse(responseCode = "400", description = "Invalid User / Missing headers / Null pointer / Folder already exist", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "Folder / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @PostMapping("/create_folder")
    public ResponseEntity<Folders> createFolder(@RequestHeader(required = false) Long folderId, @RequestBody Folders folders) {
        return folderService.addFolder(folderId, folders);
    }

    // переработать в будущем
    @GetMapping("/get_folders")
    public ResponseEntity<List<Folders>> getAllFolders() {
        return ResponseEntity.ok().body(folderService.allFolders());
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Folders.class))),
            @ApiResponse(responseCode = "400", description = "Invalid User", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "Folder / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_folder_by_id")
    public ResponseEntity<Folders> getFolderById(@RequestHeader Long folderId) {
        Users users = userService.getUserFromAuth();

        Folders folder = folderService.findFolderById(folderId);
        if(folder.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if(!folder.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя просматривать папки другим пользователям");
        }

        return ResponseEntity.ok().body(folder);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(schema = @Schema(example = "Успешно удалено"))),
            @ApiResponse(responseCode = "400", description = "Invalid User / Can't delete root dir", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "Folder / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
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

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(schema = @Schema(example = "Выбранные папки были удалены"))),
            @ApiResponse(responseCode = "400", description = "Invalid User / Can't delete root dir", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "Folder(s) / User not found or Folders not selected", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @DeleteMapping("/delete_folders_checked")
    public ResponseEntity<String> deleteFoldersChecked(@RequestBody List<Folders> folders) {
        Users users = userService.getUserFromAuth();

        if(folders.size() == 0) {
            throw new FolderNotFound("Папки не выбраны");
        }

        for(Folders folder : folders) {
            Folders checkFolder = folderService.findFolderById(folder.getId());
            if (checkFolder.getId() == null) {
                throw new FolderNotFound("Одна из папок не была найдена");
            }

            if (!folder.getUsers().getUsername().equals(users.getUsername())) {
                throw new InvalidUser("Нельзя удалять папки другим пользователям");
            }

            if (folder.isRoot()) {
                throw new FolderDeleteRootDir("Нельзя удалить корневую папку");
            }
        }

        for(Folders folder : folders) {
            try {
                FileUtils.deleteDirectory(Path.of(folder.getPath()).toFile());
            } catch (IOException e) {
                throw new FolderNotFound("Одна из папок не была найдена");
            }
        }

        foldersRepo.deleteAll(folders);

        return ResponseEntity.ok().body("Выбранные папки были удалены");
    }
}
