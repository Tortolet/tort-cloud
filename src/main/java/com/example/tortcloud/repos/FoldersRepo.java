package com.example.tortcloud.repos;

import com.example.tortcloud.models.Folders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoldersRepo extends JpaRepository<Folders, Long> {
    Folders findByName(String name);

    Folders findByUuid(String uuid);

    List<Folders> findByFolders_Id(Long id);

    List<Folders> findByFolders_Name(String name);

    List<Folders> findByFolders(Folders folders);

    Folders findByFolders_Folders_NameAndName(String name, String name1);

    Folders findByPath(String path);

    Folders findByNameAndRoot(String name, boolean root);

    List<Folders> findAllByUuid(String uuid);
}