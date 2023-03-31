package com.example.tortcloud.services;

import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FoldersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FolderService {

    private final FoldersRepo foldersRepo;

    public FolderService(FoldersRepo foldersRepo) {
        this.foldersRepo = foldersRepo;
    }

    public Folders findFolderById(Long folderId) {
        Optional<Folders> folderFromDb = foldersRepo.findById(folderId);
        return folderFromDb.orElse(new Folders());
    }

    public List<Folders> allFolders() {
        return foldersRepo.findAll();
    }
}
