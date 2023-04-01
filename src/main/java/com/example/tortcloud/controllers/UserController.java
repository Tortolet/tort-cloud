package com.example.tortcloud.controllers;

import com.example.tortcloud.exceptions.UserAlreadyExist;
import com.example.tortcloud.exceptions.UserPasswordNotConfirm;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/registration")
    public ResponseEntity<Users> addNewUser(@RequestBody Users user){

        if (!user.getPassword().equals(user.getPasswordConfirm())){
            throw new UserPasswordNotConfirm("Пароли не совпадают");
        }

        if(!userService.registrationUser(user)){
            throw new UserAlreadyExist("Пользователь уже существует");
        }

        userService.save(user);

        return ResponseEntity.ok().body(user);
    }

    @GetMapping("/get_user_by_id")
    public ResponseEntity<Users> getUserById(@RequestHeader Long id) {
        return ResponseEntity.ok().body(userService.findUserById(id));
    }

    @GetMapping("/get_user")
    public ResponseEntity<Users> getUser(){
        Users user = userService.getUserFromAuth();

        return ResponseEntity.ok().body(user);
    }

    @GetMapping("/get_users")
    public ResponseEntity<List<Users>> getAllEmployees(){
        return ResponseEntity.ok().body(userService.allUsers());
    }

}
