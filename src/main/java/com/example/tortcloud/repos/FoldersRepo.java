package com.example.tortcloud.repos;

import com.example.tortcloud.models.Folders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoldersRepo extends JpaRepository<Folders, Long> {
}