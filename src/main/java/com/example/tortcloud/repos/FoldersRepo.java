package com.example.tortcloud.repos;

import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoldersRepo extends JpaRepository<Folders, Long> {
    Folders findByName(String name);

    List<Folders> findByUsersAndInTrash(Users users, boolean inTrash);

    List<Folders> findByUsersAndBookmarkAndInTrash(Users users, boolean bookmark, boolean inTrash);

    List<Folders> findByFoldersAndInTrashOrderByNameAsc(Folders folders, boolean inTrash);

    List<Folders> findByFoldersAndInTrashOrderByNameDesc(Folders folders, boolean inTrash);

    List<Folders> findByFoldersAndInTrashOrderByDateCreatedAsc(Folders folders, boolean inTrash);

    List<Folders> findByFoldersAndInTrashOrderByDateCreatedDesc(Folders folders, boolean inTrash);

    Folders findByUuid(String uuid);

    List<Folders> findByFolders_Id(Long id);

    List<Folders> findByFolders_Name(String name);

    List<Folders> findByFolders(Folders folders);

    List<Folders> findByFoldersAndInTrash(Folders folders, boolean inTrash);

    Folders findByFolders_Folders_NameAndName(String name, String name1);

    Folders findByPath(String path);

    Folders findByNameAndRoot(String name, boolean root);

    List<Folders> findAllByUuid(String uuid);
}