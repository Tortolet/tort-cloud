package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.*;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FilesRepo;
import com.example.tortcloud.repos.FoldersRepo;
import com.example.tortcloud.schemas.AddFolderSchema;
import com.example.tortcloud.schemas.CustomResponseErrorSchema;
import com.example.tortcloud.services.FilesService;
import com.example.tortcloud.services.FolderService;
import com.example.tortcloud.services.UserService;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FolderController {

    public static final String ZIP = System.getProperty("user.dir") + "/zip";
    public static final String UPLOAD = System.getProperty("user.dir") + "\\upload";

    @Autowired
    private FolderService folderService;

    @Autowired
    private FoldersRepo foldersRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private FilesService filesService;

    @Autowired
    private FilesRepo filesRepo;

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
    @GetMapping("/get_folders_main")
    public ResponseEntity<List<Folders>> getAllFoldersMain(@RequestParam(required = false) String folderSort) {
        Users users = userService.getUserFromAuth();

        Folders mainFolder = foldersRepo.findByNameAndRoot(users.getUsername(), true);

        if(folderSort != null){
            if (folderSort.equals("asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameAsc(mainFolder, false));
            }
            if (folderSort.equals("desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameDesc(mainFolder, false));
            }
            if (folderSort.equals("date-asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedAsc(mainFolder, false));
            }
            if (folderSort.equals("date-desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedDesc(mainFolder, false));
            }
        }

        return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrash(mainFolder, false));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_folders_in_trash")
    public ResponseEntity<List<Folders>> getAllFoldersInTrash() {
        Users users = userService.getUserFromAuth();

        return ResponseEntity.ok().body(foldersRepo.findByUsersAndInTrash(users, true));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_folders_pinned")
    public ResponseEntity<List<Folders>> getAllFoldersInPinPage() {
        Users users = userService.getUserFromAuth();

        return ResponseEntity.ok().body(foldersRepo.findByUsersAndBookmarkAndInTrash(users, true, false));
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_folders_uuid/{uuid}")
    public ResponseEntity<List<Folders>> getAllFoldersByFolder(@PathVariable String uuid, @RequestParam(required = false) String folderSort) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        if (folder == null) {
            throw new FolderNotFound("Папка не найдена");
        }
        if(folder.isInTrash()){
            throw new FolderNotFound("Папка не найдена");
        }

        if(folderSort != null){
            if (folderSort.equals("asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameAsc(folder, false));
            }
            if (folderSort.equals("desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameDesc(folder, false));
            }
            if (folderSort.equals("date-asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedAsc(folder, false));
            }
            if (folderSort.equals("date-desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedDesc(folder, false));
            }
        }

        return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrash(folder, false));
    }

    @GetMapping("/get_folders_uuid_shared/{uuid}")
    public ResponseEntity<List<Folders>> getSharedFolders(@PathVariable String uuid, @RequestParam(required = false) String folderSort) {
        Folders folder = foldersRepo.findByUuid(uuid);

        if (folder == null) {
            throw new FolderNotFound("Папка не найдена");
        }
        if(folder.isInTrash()){
            throw new FolderNotFound("Папка не найдена");
        }

        String path = folder.getPath();
        String[] folders = path.split("\\\\");
        boolean foundUsername = false;
        List<String> newFolders = new ArrayList<>();

        StringBuilder builder = new StringBuilder();

        List<Folders> foldersList = new ArrayList<>();

        String startPath = null;

        for (String folder1 : folders) {
            if (folder1.equals(folder.getUsers().getUsername())) {
                foundUsername = true;
                startPath = UPLOAD + "\\" + folder1;
            }

            if (foundUsername) {
                newFolders.add(folder1);
            }
        }

        for (String folder1 : newFolders){
            if(!folder1.equals(folder.getUsers().getUsername())) {
                builder.append("\\").append(folder1);
            }
            Folders newFolder = foldersRepo.findByPath(startPath + builder);
            if(newFolder.isInTrash()){
                throw new FolderNotFound("Папка не найдена");
            }
            foldersList.add(newFolder);
        }

        Folders startFolderShare = new Folders();
        for (Folders folderShare : foldersList) {
            if (folderShare.isShared()){
                startFolderShare = folderShare;
                break;
            }
        }

        if (startFolderShare.getPath() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if (!folder.getPath().contains(startFolderShare.getPath())){
            throw new FolderNotFound("Папка не найдена");
        }

        if(folderSort != null){
            if (folderSort.equals("asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameAsc(folder, false));
            }
            if (folderSort.equals("desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByNameDesc(folder, false));
            }
            if (folderSort.equals("date-asc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedAsc(folder, false));
            }
            if (folderSort.equals("date-desc")){
                return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrashOrderByDateCreatedDesc(folder, false));
            }
        }

        return ResponseEntity.ok().body(foldersRepo.findByFoldersAndInTrash(folder, false));
    }

    @GetMapping("/get_folder_uuid/{uuid}")
    public ResponseEntity<Folders> getFolderByFolder(@PathVariable String uuid) {
//        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);

        return ResponseEntity.ok().body(folder);
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_folder_main_uuid")
    public ResponseEntity<Folders> getFolderMain() {
        Users users = userService.getUserFromAuth();

        Folders mainFolder = foldersRepo.findByNameAndRoot(users.getUsername(), true);

        return ResponseEntity.ok().body(mainFolder);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/pin_folder/{uuid}")
    public String pinFolder(@PathVariable String uuid) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        folder.setBookmark(true);

        foldersRepo.save(folder);

        return "Папка с названием " + folder.getName() + " была закреплена";
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/unpin_folder/{uuid}")
    public String unpinFolder(@PathVariable String uuid) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        folder.setBookmark(false);

        foldersRepo.save(folder);

        return "Папка с названием " + folder.getName() + " была откреплена";
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/share_folder/{uuid}")
    public String shareFolder(@PathVariable String uuid) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        folder.setShared(true);

        foldersRepo.save(folder);

        return "Папка с названием " + folder.getName() + " была поделена";
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/unshared_folder/{uuid}")
    public String unShareFolder(@PathVariable String uuid) {
        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        folder.setShared(false);

        foldersRepo.save(folder);

        return "Папка с названием " + folder.getName() + " была отключена от деления";
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

    @SecurityRequirement(name = "basicAuth")
    @PutMapping ("/folder_to_trash")
    public ResponseEntity<Folders> updateFolderToDeleteFolder(@RequestHeader Long folderId){
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

        folders.setInTrash(true);
        foldersRepo.save(folders);

        return ResponseEntity.ok().body(folders);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping ("/return_folder")
    public ResponseEntity<Folders> returnFolder(@RequestHeader Long folderId){
        Users users = userService.getUserFromAuth();

        Folders folders = folderService.findFolderById(folderId);
        if(folders.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        if(!folders.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя возвращать папки других пользователей");
        }

        folders.setInTrash(false);
        foldersRepo.save(folders);

        return ResponseEntity.ok().body(folders);
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

    @GetMapping("/get_bytes_folder/{uuid}")
    public String getFolderBytes(@PathVariable String uuid){
//        Users users = userService.getUserFromAuth();

        Folders folder = foldersRepo.findByUuid(uuid);
        long bytes = FileUtils.sizeOfDirectory(Path.of(folder.getPath()).toFile());

        return filesService.humanReadableByteCountSI(bytes);
    }

    @GetMapping("/download")
    public ResponseEntity<ByteArrayResource> downloadFile(@RequestParam String uuid) throws IOException {
//        Users users = userService.getUserFromAuth();

        Folders folders = foldersRepo.findByUuid(uuid);
        String zipName = "archive-" + folders.getUsers().getUsername() + ".zip";

        folderService.zipFolder(folders.getId());

        // Load file from the file system
        Path filePath = Paths.get(ZIP, zipName);
        byte[] data = Files.readAllBytes(filePath);
        ByteArrayResource resource = new ByteArrayResource(data);

        // Guess the content type based on the file name extension
        String contentType = URLConnection.guessContentTypeFromName(zipName);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        // Set the content disposition header
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + zipName + "\"");

        FileUtils.delete(filePath.toFile());

        // Return the response entity
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(data.length)
                .body(resource);
    }

    @SecurityRequirement(name = "basicAuth")
    @PutMapping("/edit_folder_name")
    public ResponseEntity<Folders> editFolderName(@RequestBody Folders name, @RequestHeader String uuid){
        Users users = userService.getUserFromAuth();
        Folders folder = foldersRepo.findByUuid(uuid);
        List<Folders> checkFolder = foldersRepo.findByFolders(folder.getFolders());

        for (Folders check : checkFolder) {
            if(check.getName().equals(name.getName())){
                throw new FolderAlreadyExist("Папка '" + check.getName() + "' уже существует данной папке");
            }
        }

        if(!folder.getUsers().equals(users)) {
            throw new InvalidUser("Нельзя изменять папки других пользователей");
        }

        if(folder.isRoot()) {
            throw new FolderDeleteRootDir("Нельзя изменять корневую папку");
        }

        folder.setName(name.getName());
        folder.setDateModified(LocalDateTime.now());

        foldersRepo.save(folder);

        return ResponseEntity.ok().body(folder);
    }

    @SecurityRequirement(name = "basicAuth")
    @PostMapping("/add_folders")
    public ResponseEntity<String> addNewFoldersWithFiles(@RequestHeader String folderUUID, @RequestBody MultipartFile[] files) {
        Users users = userService.getUserFromAuth();

        long sizeOfMultipartFiles = 0L;
        Long sizeOfFilesDb = filesRepo.findByUsers(users);
        long res;

        Folders folder = foldersRepo.findByUuid(folderUUID);
        if(folder.getId() == null){
            throw new FolderNotFound("Папка не найдена");
        }

        for (MultipartFile file : files){
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

        for(MultipartFile file : files) {
            Path fileNameAndPath = Paths.get(folder.getPath(), file.getOriginalFilename());
             com.example.tortcloud.models.Files files1 = new com.example.tortcloud.models.Files();
            files1.setLocation(file.getOriginalFilename());

            // создание папок
            String resTest = fileNameAndPath.toString().substring(0, fileNameAndPath.toString().lastIndexOf("\\"));
            String[] folders = resTest.split("\\\\");
            String lastDir = folder.getPath().substring(folder.getPath().lastIndexOf("\\") + 1);
            boolean lastDirBool = false;

            String parentFolder = null;
            StringBuilder forSetFolder = new StringBuilder();
            for (String folders1 : folders) {
                Folders folderNew = new Folders();
                if (folders1.equals(lastDir)) {
                    lastDirBool = true;
                    parentFolder = folders1;
                }

                if (lastDirBool) {
                    if(!folders1.equals(lastDir)) {
                        forSetFolder.append("\\").append(folders1);
                        Folders folderFound = foldersRepo.findByFolders_Folders_NameAndName(parentFolder, folders1);

                        if(folderFound == null){
                            System.out.println(folder.getPath() + forSetFolder);
                            Folders folderFoundPath = foldersRepo.findByPath(folder.getPath() + forSetFolder);

                            folderNew.setPath(folder.getPath() + forSetFolder);
                            folderNew.setName(folders1);
                            folderNew.setBookmark(false);
                            folderNew.setUuid(UUID.randomUUID().toString());
                            folderNew.setUsers(users);

                            String path = folder.getPath() + forSetFolder;
                            String newPath = path.substring(0, path.lastIndexOf("\\"));
                            Folders folderFoundFolder = foldersRepo.findByPath(newPath);
                            if (folderFoundFolder != null){
                                folderNew.setFolders(folderFoundFolder);
                            }

                            if(folderFoundPath == null)
                                folderService.save(folderNew);
                        }
                    }
                }

                parentFolder = folders1;
            }
            if(!Files.exists(Path.of(resTest))) {
                new File(resTest).mkdirs();
            }

            // создание файлов
            try {
                if(!Objects.requireNonNull(file.getOriginalFilename()).isEmpty())
                    Files.write(fileNameAndPath, file.getBytes());
                if(!files1.getLocation().isEmpty()) {
                    String path = files1.getLocation();
                    String newPath = path.replace("/", "\\");
                    String forPathFolder = newPath.substring(0, newPath.lastIndexOf("\\"));
                    Folders pathFolder = foldersRepo.findByPath(folder.getPath() + "\\" + forPathFolder);
                    if (pathFolder != null) {
                        files1.setFolder(pathFolder);
                    }
                    String fileName = newPath.substring(newPath.lastIndexOf("\\") + 1);
                    files1.setLocation(fileName);
                    files1.setName(file.getName());
                    files1.setSize(file.getSize());
                    files1.setFormat(file.getContentType());
                    files1.setUsers(users);
                    files1.setInTrash(false);
                    files1.setBookmark(false);
                    files1.setDateCreated(LocalDateTime.now());
                    files1.setDateModified(LocalDateTime.now());

                    com.example.tortcloud.models.Files checkFile = filesRepo.findByLocationAndFolder(files1.getLocation(), pathFolder);
                    if (checkFile == null) {
                        filesRepo.save(files1);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok().body("OK");
    }

    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_all_path")
    public ResponseEntity<List<Folders>> getAllPath(@RequestHeader String uuid) {
        Users users = userService.getUserFromAuth();
        Folders startFolder = foldersRepo.findByNameAndRoot(users.getUsername(), true);

        StringBuilder builder = new StringBuilder();

        List<Folders> foldersList = new ArrayList<>();

        Folders endFolder = foldersRepo.findByUuid(uuid);
        String path = endFolder.getPath();
        String[] folders = path.split("\\\\");
        boolean foundUsername = false;
        List<String> newFolders = new ArrayList<>();

        for (String folder : folders) {
            if (folder.equals(users.getUsername())) {
                foundUsername = true;
            }

            if (foundUsername) {
                newFolders.add(folder);
            }
        }

        for (String folder : newFolders){
            if(!folder.equals(users.getUsername())) {
                builder.append("\\").append(folder);
            }
            Folders newFolder = foldersRepo.findByPath(startFolder.getPath() + builder);
            if(newFolder.isInTrash()){
                throw new FolderNotFound("Папка не найдена");
            }
            foldersList.add(newFolder);
        }


        return ResponseEntity.ok().body(foldersList);
    }

    @GetMapping("/get_folder_path_for_js")
    public String path(@RequestParam Long id) {
        Folders folder = folderService.findFolderById(id);

        String path = folder.getPath();

        return path.replace("\\", "\\\\");
    }
}
