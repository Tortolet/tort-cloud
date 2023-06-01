package com.example.tortcloud.repos;

import com.example.tortcloud.models.Files;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FilesRepo extends JpaRepository<Files, Long> {
    Files findByLocation(String location);

    Files findByLocationAndFolder(String location, Folders folder);


    List<Files> findByFolder(Folders folder);

    List<Files> findByFolderAndInTrash(Folders folder, boolean inTrash);

    List<Files> findByUsersAndBookmarkAndInTrash(Users users, boolean bookmark, boolean inTrash);

    List<Files> findByUsersAndInTrash(Users users, boolean inTrash);

    List<Files> findByFolderAndInTrashOrderByLocationAsc(Folders folders, boolean inTrash);

    List<Files> findByFolderAndInTrashOrderByLocationDesc(Folders folders, boolean inTrash);

    List<Files> findByFolderAndInTrashOrderByDateCreatedAsc(Folders folders, boolean inTrash);

    List<Files> findByFolderAndInTrashOrderByDateCreatedDesc(Folders folders, boolean inTrash);

    @Query("select sum(f.size) from Files f where f.users = ?1")
    Long findByUsers(Users users);


}