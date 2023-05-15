package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.AccessAlreadyExist;
import com.example.tortcloud.exceptions.InvalidCompany;
import com.example.tortcloud.models.Accesses;
import com.example.tortcloud.models.Companies;
import com.example.tortcloud.repos.AccessesRepo;
import com.example.tortcloud.repos.UsersRepo;
import com.example.tortcloud.services.CompaniesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AccessController {

    @Autowired
    private AccessesRepo accessesRepo;

    @Autowired
    private CompaniesService companiesService;

    @Autowired
    private UsersRepo usersRepo;

    @PostMapping("/create_access")
    public ResponseEntity<Accesses> addNewAccess(@RequestBody Accesses accesses, @RequestHeader Long companyId) {
        Companies company = companiesService.findCompanyById(companyId);
        accesses.setCompany(company);

        if (company.getId() == null){
            throw new InvalidCompany("Такой компании не существует");
        }

        if (usersRepo.findByEmail(accesses.getEmail()) != null){
            throw new AccessAlreadyExist("Пользователь уже зарегестрирован");
        }

        if (accessesRepo.findByEmail(accesses.getEmail()) != null) {
            throw new AccessAlreadyExist("Доступ к почте уже существует");
        }

        accessesRepo.save(accesses);
        return ResponseEntity.ok().body(accesses);
    }
}
