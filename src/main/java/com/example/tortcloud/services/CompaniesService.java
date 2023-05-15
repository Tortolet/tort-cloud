package com.example.tortcloud.services;

import com.example.tortcloud.models.Companies;
import com.example.tortcloud.repos.CompaniesRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompaniesService {

    private final CompaniesRepo companiesRepo;

    public CompaniesService(CompaniesRepo companiesRepo) {
        this.companiesRepo = companiesRepo;
    }

    public Companies findCompanyById(Long companyId) {
        Optional<Companies> companiesFromDb = companiesRepo.findById(companyId);
        return companiesFromDb.orElse(new Companies());
    }

    public List<Companies> allCompanies() {
        return companiesRepo.findAll();
    }
}
