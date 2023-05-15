package com.example.tortcloud.repos;

import com.example.tortcloud.models.Accesses;
import com.example.tortcloud.models.Companies;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessesRepo extends JpaRepository<Accesses, Long> {
    Accesses findByCompanyAndEmail(Companies company, String email);

    Accesses findByEmail(String email);
}