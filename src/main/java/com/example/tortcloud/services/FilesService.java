package com.example.tortcloud.services;

import com.example.tortcloud.models.Files;
import com.example.tortcloud.repos.FilesRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FilesService {

    private final FilesRepo filesRepo;

    public FilesService(FilesRepo filesRepo) {
        this.filesRepo = filesRepo;
    }

    public Files findFileById(Long fileId) {
        Optional<Files> fileFromDb = filesRepo.findById(fileId);
        return fileFromDb.orElse(new Files());
    }

    public List<Files> allFolders() {
        return filesRepo.findAll();
    }
}
