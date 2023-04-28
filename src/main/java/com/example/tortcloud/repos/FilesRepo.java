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

    @Query("select sum(f.size) from Files f where f.users = ?1")
    Long findByUsers(Users users);


}