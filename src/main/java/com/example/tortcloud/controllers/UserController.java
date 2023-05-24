package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.*;
import com.example.tortcloud.models.Companies;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.AccessesRepo;
import com.example.tortcloud.repos.CompaniesRepo;
import com.example.tortcloud.repos.UsersRepo;
import com.example.tortcloud.schemas.AddUserSchema;
import com.example.tortcloud.schemas.CustomResponseErrorSchema;
import com.example.tortcloud.schemas.MessageSchema;
import com.example.tortcloud.services.CompaniesService;
import com.example.tortcloud.services.DefaultEmailService;
import com.example.tortcloud.services.UserService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.constraints.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

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

    @Autowired
    private DefaultEmailService defaultEmailService;

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

    @PutMapping("/update_user_password")
    public ResponseEntity<String> editUserPassword(@RequestHeader String oldPassword, @RequestHeader String newPassword, @RequestHeader String newPasswordConfirm) {
        Users user = userService.getUserFromAuth();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (encoder.matches(oldPassword, user.getPassword())) {
            if (Objects.equals(newPassword, newPasswordConfirm)) {
                user.setPassword(newPassword);
                userService.saveWithoutFolder(user);

                return ResponseEntity.ok().body("Вы успешно изменили пароль у пользователя: " + user.getUsername());
            } else {
                return ResponseEntity.badRequest().body("Пароли не совпадают");
            }
        } else {
            return ResponseEntity.badRequest().body("Старый пароль неверен");

        }
    }

    @PutMapping("/update_email")
    public ResponseEntity<Users> updateEmailUser(@RequestHeader @Email String email) {
        Users user = userService.getUserFromAuth();

        Users userInBDEmail = usersRepo.findByEmail(email);
        if(userInBDEmail != null){
            throw new UserAlreadyExist("Пользователь с такой почтой уже существует");
        }

        if(email.isEmpty()){
            throw new AccessDenied("Ошибка. Почта пуста");
        }

        user.setEmail(email);
        usersRepo.save(user);

        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/sent_message_to_admin")
    public ResponseEntity<MessageSchema> sentMessage(@RequestBody String message) {
        Users user = userService.getUserFromAuth();

        if(message.isEmpty()){
            throw new AccessDenied("Ошибка. Сообщение не может быть пустым");
        }

        MessageSchema messageSent = new MessageSchema(
                "ivanmineev52@gmail.com",
                "Обращение от " + user.getUsername() + " (" + user.getEmail() + ", " + user.getCompanies().getCompany() + ")",
                message
        );

        defaultEmailService.sendSimpleEmail(messageSent);

        return ResponseEntity.ok().body(messageSent);
    }
}
