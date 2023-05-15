package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.CompanyAlreadyExist;
import com.example.tortcloud.models.Companies;
import com.example.tortcloud.repos.CompaniesRepo;
import com.example.tortcloud.services.CompaniesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CompanyController {

    private final CompaniesRepo companiesRepo;

    public CompanyController(CompaniesRepo companiesRepo) {
        this.companiesRepo = companiesRepo;
    }

    @PostMapping("/create_company")
    public ResponseEntity<Companies> addNewCompany(@RequestBody Companies company) {
        if (companiesRepo.findByCompany(company.getCompany()) != null){
            throw new CompanyAlreadyExist("Компания уже существует");
        }

        companiesRepo.save(company);
        return ResponseEntity.ok().body(company);
    }
}
