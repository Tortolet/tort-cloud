package com.example.tortcloud.repos;

import com.example.tortcloud.models.Folders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoldersRepo extends JpaRepository<Folders, Long> {
    Folders findByName(String name);

    Folders findByUuid(String uuid);

    List<Folders> findByFolders_Id(Long id);

    List<Folders> findByFolders_Name(String name);
}