package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.*;
import com.example.tortcloud.models.Files;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FilesRepo;
import com.example.tortcloud.repos.FoldersRepo;
import com.example.tortcloud.schemas.CustomResponseErrorSchema;
import com.example.tortcloud.services.FilesService;
import com.example.tortcloud.services.FolderService;
import com.example.tortcloud.services.UserService;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLConnection;
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

    @Autowired
    private FoldersRepo foldersRepo;


    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(schema = @Schema(example = "Файлы были успешно загружены"))),
            @ApiResponse(responseCode = "400", description = "Invalid User / File already exist in folder", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "Folder / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @PostMapping("/add_files")
    public ResponseEntity<String> addFiles(@RequestBody MultipartFile[] files, @RequestHeader Long folderId) {
        Users users = userService.getUserFromAuth();

        Folders folders = folderService.findFolderById(folderId);
        if(folders.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if(!folders.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя добавлять файлы другим пользователям");
        }

        List<Files> checkFiles = filesRepo.findByFolder(folders);
        long sizeOfMultipartFiles = 0L;
        Long sizeOfFilesDb = filesRepo.findByUsers(users);
        long res;

        for (MultipartFile file : files){
            Files checkFile = filesRepo.findByLocationAndFolder(file.getOriginalFilename(), folders);
            for(Files file1 : checkFiles){
                if(file1.equals(checkFile)){
                    throw new FileAlreadyExist("Файл " + checkFile.getLocation() + " уже существует в данной папке");
                }
            }

            sizeOfMultipartFiles += file.getSize();
        }

        if(sizeOfFilesDb == null){
            if(sizeOfMultipartFiles > users.getStorage()){
                throw new UserStorageIsAlreadyFull("Недостаточно места на диске");
            }
        }

        if (sizeOfFilesDb != null) {
            res = sizeOfMultipartFiles + sizeOfFilesDb;
            if(res > users.getStorage()){
                throw new UserStorageIsAlreadyFull("Недостаточно места на диске");
            }
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

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Files.class))),
            @ApiResponse(responseCode = "400", description = "Invalid User", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "File / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_file_by_id")
    public ResponseEntity<Files> getFileById(@RequestHeader Long fileId) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(fileId);
        if(file.getId() == null){
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя просматривать файлы другим пользователям");
        }

        return ResponseEntity.ok().body(file);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(schema = @Schema(example = "Файл [file] был успешно удален"))),
            @ApiResponse(responseCode = "400", description = "Invalid User", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "File / User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @DeleteMapping("/delete_file")
    public ResponseEntity<String> deleteFile(@RequestHeader Long fileId) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(fileId);
        if(file.getId() == null){
            throw new FileNotFound("Файл не найден");
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

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Files.class)))),
            @ApiResponse(responseCode = "400", description = "Invalid User", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "File(s) / User not found or No files selected", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @DeleteMapping("/delete_files_checked")
    public ResponseEntity<String> deleteFilesChecked(@RequestBody List<Files> files) {
        Users users = userService.getUserFromAuth();

        String path;

        if(files.size() == 0) {
            throw new FileNotFound("Файлы не выбраны");
        }

        for (Files file: files){
            Files checkFile = filesService.findFileById(file.getId());
            if (checkFile.getId() == null) {
                throw new FileNotFound("Один из файлов не найден");
            }

            if (!file.getUsers().getUsername().equals(users.getUsername())) {
                throw new InvalidUser("Нельзя удалять файлы другим пользователям");
            }
        }

        for (Files file : files) {
            path = file.getFolder().getPath() + "/" + file.getLocation();
            try {
                FileUtils.delete(Path.of(path).toFile());
            } catch (IOException e) {
                throw new FileNotFound("Один из файлов не был найден");
            }
        }

        filesRepo.deleteAll(files);

        return ResponseEntity.ok().body("Файлы были удалены");
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_bytes")
    public String getBytesByUser() {
        Users users = userService.getUserFromAuth();

        Long bytes = filesRepo.findByUsers(users);
        if(bytes == null) {
            return "0";
        }

        return bytes.toString();
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_bytes_si")
    public String getBytesByUserSI() {
        Users users = userService.getUserFromAuth();

        Long bytes = filesRepo.findByUsers(users);
        if(bytes == null) {
            return filesService.humanReadableByteCountSI(0);
        }

        return filesService.humanReadableByteCountSI(bytes);
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_bytes_si_by_user")
    public String getBytesByUserStorageSI() {
        Users users = userService.getUserFromAuth();

        return filesService.humanReadableByteCountSI(users.getStorage());
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_files_main")
    public ResponseEntity<List<Files>> getAllFilesMain(@RequestParam(required = false) String fileSort) {
        Users users = userService.getUserFromAuth();

        Folders mainFolder = foldersRepo.findByNameAndRoot(users.getUsername(), true);

        if(fileSort != null) {
            if (fileSort.equals("asc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByLocationAsc(mainFolder, false));
            }
            if (fileSort.equals("desc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByLocationDesc(mainFolder, false));
            }
            if (fileSort.equals("date-asc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByDateCreatedAsc(mainFolder, false));
            }
            if (fileSort.equals("date-desc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByDateCreatedDesc(mainFolder, false));
            }
        }

        return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrash(mainFolder, false));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_files_folder/{uuid}")
    public ResponseEntity<List<Files>> getAllFilesFolder(@PathVariable String uuid, @RequestParam(required = false) String fileSort) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);

        if(fileSort != null) {
            if (fileSort.equals("asc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByLocationAsc(folder, false));
            }
            if (fileSort.equals("desc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByLocationDesc(folder, false));
            }
            if (fileSort.equals("date-asc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByDateCreatedAsc(folder, false));
            }
            if (fileSort.equals("date-desc")) {
                return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrashOrderByDateCreatedDesc(folder, false));
            }
        }

        return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrash(folder, false));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_files_pinned")
    public ResponseEntity<List<Files>> getPinnedFiles() {
        Users users = userService.getUserFromAuth();

        return ResponseEntity.ok().body(filesRepo.findByUsersAndBookmarkAndInTrash(users, true, false));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_files_trash")
    public ResponseEntity<List<Files>> getTrashFiles() {
        Users users = userService.getUserFromAuth();

        return ResponseEntity.ok().body(filesRepo.findByUsersAndInTrash(users, true));
    }

    @GetMapping("/get_files_shared/{uuid}")
    public ResponseEntity<List<Files>> getFilesFolderShared(@PathVariable String uuid) {
        Folders folder = foldersRepo.findByUuid(uuid);

        return ResponseEntity.ok().body(filesRepo.findByFolderAndInTrash(folder, false));
    }

    @GetMapping("/get_bytes_file/{id}")
    public String getCurrentFileBytes(@PathVariable Long id) {
//        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        long bytes = file.getSize();

        return filesService.humanReadableByteCountSI(bytes);
    }

    @GetMapping("/view")
    public ResponseEntity<ByteArrayResource> viewFile(@RequestParam("id") Long id) throws IOException {
        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        // Load file from the file system
        Path filePath = Paths.get(file.getFolder().getPath() + "\\" + file.getLocation());
        byte[] data = java.nio.file.Files.readAllBytes(filePath);
        ByteArrayResource resource = new ByteArrayResource(data);

        // Guess the content type based on the file name extension
        String contentType = URLConnection.guessContentTypeFromName(file.getLocation());
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        // Set the content type header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);
//        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getLocation() + "\"");

        // Return the response entity
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping("/download-file")
    public ResponseEntity<ByteArrayResource> downloadFile(@RequestParam Long id) throws IOException {
        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        // Load file from the file system
        Path filePath = Paths.get(file.getFolder().getPath() + "\\" + file.getLocation());
        byte[] data = java.nio.file.Files.readAllBytes(filePath);
        ByteArrayResource resource = new ByteArrayResource(data);

        // Guess the content type based on the file name extension
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        // Set the content disposition header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);

        // Return the response entity
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(data.length)
                .body(resource);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/pin_file")
    public ResponseEntity<Files> pinFile(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setBookmark(true);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/unpin_file")
    public ResponseEntity<Files> unpinFile(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setBookmark(false);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/update_location")
    public ResponseEntity<Files> updateLocation(@RequestHeader Long id, @RequestBody String newLocation) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        List<Files> checkFiles = filesRepo.findByFolder(file.getFolder());
        String oldLocation = file.getLocation();

        if (newLocation == null || newLocation.isEmpty()) {
            throw new AccessDenied("Новое название пустое");
        }

        if (newLocation.matches(".*[.,].*")) {
            throw new AccessDenied("В тексте не должно быть символов как точка или запятая");
        }

        String format = file.getLocation().substring(file.getLocation().indexOf("."));
        file.setLocation(newLocation + format);

        Files checkFile = filesRepo.findByLocationAndFolder(file.getLocation(), file.getFolder());
        for(Files file1 : checkFiles){
            if(file1.equals(checkFile)){
                throw new FileAlreadyExist("Файл " + checkFile.getLocation() + " уже существует в данной папке");
            }
        }

        File file2 = new File(file.getFolder().getPath() + "\\" + oldLocation);
        File newFile = new File(file.getFolder().getPath() + "\\" + file.getLocation());
        try {
            FileUtils.moveFile(file2, newFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        file.setDateModified(LocalDateTime.now());
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/share_file")
    public ResponseEntity<Files> shareFile(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setShared(true);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/share_file_false")
    public ResponseEntity<Files> shareFileFalse(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setShared(false);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @GetMapping("/get_shared_file")
    public ResponseEntity<Files> getSharedFile(@RequestParam Long id) {
        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if (!file.isShared()) {
            throw new AccessDenied("Файл запрещен для просмотра");
        }

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/file_to_trash")
    public ResponseEntity<Files> fileToTrash(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setInTrash(true);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/return_file")
    public ResponseEntity<Files> returnFileFromTrash(@RequestHeader Long id) {
        Users users = userService.getUserFromAuth();

        Files file = filesService.findFileById(id);
        if (file == null) {
            throw new FileNotFound("Файл не найден");
        }

        if(!file.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять файлы других пользователей");
        }

        file.setInTrash(false);
        filesRepo.save(file);

        return ResponseEntity.ok().body(file);
    }
}
