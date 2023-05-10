package com.example.tortcloud.services;

import com.example.tortcloud.exceptions.FolderAlreadyExist;
import com.example.tortcloud.exceptions.FolderNotFound;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FoldersRepo;
import org.apache.commons.io.FileUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FolderService {

    public static final String ZIP = System.getProperty("user.dir") + "/zip";

    private final FoldersRepo foldersRepo;

    private final UserService userService;

    public FolderService(FoldersRepo foldersRepo, UserService userService) {
        this.foldersRepo = foldersRepo;
        this.userService = userService;
    }

    public Folders findFolderById(Long folderId) {
        Optional<Folders> folderFromDb = foldersRepo.findById(folderId);
        return folderFromDb.orElse(new Folders());
    }

    public List<Folders> allFolders() {
        return foldersRepo.findAll();
    }

    public void save(Folders folders) {

        LocalDateTime createDate = LocalDateTime.now();
        folders.setDateCreated(createDate);

        LocalDateTime modifiedDate = LocalDateTime.now();
        folders.setDateModified(modifiedDate);

        folders.setRoot(false);
        folders.setInTrash(false);

        foldersRepo.save(folders);
    }

    public ResponseEntity<Folders> addFolder(Long folderId, Folders folders) {
        Users users = userService.getUserFromAuth();

        String uuid = UUID.randomUUID().toString();
        folders.setUuid(uuid);

        if (folderId != null) {
            List<Folders> foldersList = foldersRepo.findByFolders_Id(folderId);
            for (Folders folder : foldersList) {
                Folders folders1 = this.findFolderById(folder.getId());
                if(folders1.getName().equals(folders.getName())) {
                    throw new FolderAlreadyExist("Создаваемая папка '" + folders.getName() + "' уже существует данной папке");
                }
            }

            Folders motherFolder = this.findFolderById(folderId);
            if(motherFolder.getId() == null){
                throw new FolderNotFound("Папка не найдена");
            }

            if(motherFolder.getId() != null) {
                folders.setFolders(motherFolder);

                String path = motherFolder.getPath();
                Path pathEnd = Paths.get(path, folders.getUuid());
                new File(pathEnd.toString()).mkdir();
                folders.setPath(pathEnd.toString());
            }
        }

        if(folderId == null) {
            List<Folders> foldersList = foldersRepo.findByFolders_Name(users.getUsername());
            for (Folders folder : foldersList) {
                Folders folders1 = this.findFolderById(folder.getId());
                if(folders1.getName().equals(folders.getName())) {
                    throw new FolderAlreadyExist("Создаваемая папка '" + folders.getName() + "' уже существует данной папке");
                }
            }

            Folders rootDir = foldersRepo.findByName(users.getUsername());
            folders.setFolders(rootDir);

            String path = rootDir.getPath();
            Path pathEnd = Paths.get(path, folders.getUuid());
            new File(pathEnd.toString()).mkdir();
            folders.setPath(pathEnd.toString());
        }

        folders.setUsers(users);

        this.save(folders);

        return ResponseEntity.ok().body(folders);
    }

    public void zipFolder(Long folderId) throws IOException {
        Folders folder = this.findFolderById(folderId);

        // Specify the source directory and the output zip file name
        File sourceDir = new File(Path.of(folder.getPath()).toFile().toURI());
        File outputFile = new File(ZIP + "/archive-" + folder.getUsers().getUsername() + ".zip");

        // Create a ZipOutputStream to write to the output file
        FileOutputStream fos = new FileOutputStream(outputFile);
        ZipOutputStream zipOut = new ZipOutputStream(fos);

        // Iterate over all files and directories in the source directory
        for (File file : FileUtils.listFiles(sourceDir, null, true)) {

            // Create a new ZipEntry for the current file
            ZipEntry zipEntry = new ZipEntry(sourceDir.toPath().relativize(file.toPath()).toString());
            zipOut.putNextEntry(zipEntry);

            // Copy the contents of the file to the zip stream
            if (!file.isDirectory()) {
                FileInputStream fis = new FileInputStream(file);
                byte[] buffer = new byte[1024];
                int length;
                while ((length = fis.read(buffer)) > 0) {
                    zipOut.write(buffer, 0, length);
                }
                fis.close();
            }

            // Close the current zip entry
            zipOut.closeEntry();
        }

        // Close the ZipOutputStream
        zipOut.close();
        fos.close();
    }
}
