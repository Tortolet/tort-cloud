package com.example.tortcloud.services;

import com.example.tortcloud.models.Files;
import com.example.tortcloud.repos.FilesRepo;
import org.springframework.stereotype.Service;

import java.text.CharacterIterator;
import java.text.StringCharacterIterator;
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

    public String humanReadableByteCountSI(long bytes) {
        if (-1000 < bytes && bytes < 1000) {
            return bytes + " B";
        }
        CharacterIterator ci = new StringCharacterIterator("kMGTPE");
        while (bytes <= -999_950 || bytes >= 999_950) {
            bytes /= 1000;
            ci.next();
        }
        return String.format("%.1f %cB", bytes / 1000.0, ci.current());
    }
}
