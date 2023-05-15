package com.example.tortcloud.repos;

import com.example.tortcloud.models.Companies;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompaniesRepo extends JpaRepository<Companies, Long> {
    Companies findByCompany(String company);
}