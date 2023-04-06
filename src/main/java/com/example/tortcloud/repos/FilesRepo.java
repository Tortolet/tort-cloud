package com.example.tortcloud.repos;

import com.example.tortcloud.models.Files;
import com.example.tortcloud.models.Folders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FilesRepo extends JpaRepository<Files, Long> {
    Files findByLocation(String location);

    List<Files> findByFolder(Folders folder);
}