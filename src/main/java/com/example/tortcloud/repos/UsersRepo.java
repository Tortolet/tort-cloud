package com.example.tortcloud.repos;

import com.example.tortcloud.models.Companies;
import com.example.tortcloud.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepo extends JpaRepository<Users, Long> {
    Users findByUsername(String username);

    Users findByEmail(String email);

    long countByCompanies(Companies companies);

}