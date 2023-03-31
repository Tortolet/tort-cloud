package com.example.tortcloud.repos;

import com.example.tortcloud.models.Files;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FilesRepo extends JpaRepository<Files, Long> {
}