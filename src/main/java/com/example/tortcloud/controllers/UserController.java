package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.*;
import com.example.tortcloud.models.Companies;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.AccessesRepo;
import com.example.tortcloud.repos.CompaniesRepo;
import com.example.tortcloud.repos.UsersRepo;
import com.example.tortcloud.schemas.AddUserSchema;
import com.example.tortcloud.schemas.CustomResponseErrorSchema;
import com.example.tortcloud.services.CompaniesService;
import com.example.tortcloud.services.UserService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private CompaniesService companiesService;

    @Autowired
    private AccessesRepo accessesRepo;

    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = AddUserSchema.class)))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Users.class))),
            @ApiResponse(responseCode = "400", description = "Password not confirm / User already exist", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
    })
    @PostMapping("/registration")
    public ResponseEntity<Users> addNewUser(@RequestBody Users user, @RequestHeader Long companyId){

        Companies company = companiesService.findCompanyById(companyId);

        if (company.getId() == null){
            throw new InvalidCompany("Такой компании не существует");
        }

        user.setCompanies(company);

        if (!user.getPassword().equals(user.getPasswordConfirm())){
            throw new UserPasswordNotConfirm("Пароли не совпадают");
        }

        if (usersRepo.countByCompanies(user.getCompanies()) > company.getStaff()) {
            throw new CrowdedEmployees("Количество сотрудников превышено");
        }

        if(!userService.registrationUser(user)){
            throw new UserAlreadyExist("Пользователь уже существует");
        }

        if (accessesRepo.findByCompanyAndEmail(company, user.getEmail()) == null) {
            throw new AccessDenied("Доступ запрещен");
        }

        userService.save(user);
        accessesRepo.delete(accessesRepo.findByCompanyAndEmail(company, user.getEmail()));

        return ResponseEntity.ok().body(user);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Users.class))),
            @ApiResponse(responseCode = "400", description = "Missing headers", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CustomResponseErrorSchema.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Users.class)))
    })
    @GetMapping("/get_user_by_id")
    public ResponseEntity<Users> getUserById(@RequestHeader Long id) {
        return ResponseEntity.ok().body(userService.findUserById(id));
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Users.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Users.class)))
    })
    @SecurityRequirement(name = "basicAuth")
    @GetMapping("/get_user")
    public ResponseEntity<Users> getUser(){
        Users user = userService.getUserFromAuth();

        return ResponseEntity.ok().body(user);
    }

    // переработать в будущем
    @GetMapping("/get_users")
    public ResponseEntity<List<Users>> getAllEmployees(){
        return ResponseEntity.ok().body(userService.allUsers());
    }

    @GetMapping("/get_user_storage")
    public String getUserStorage() {
        Users users = userService.getUserFromAuth();

        return String.valueOf(users.getStorage());
    }

}
