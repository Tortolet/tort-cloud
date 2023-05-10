package com.example.tortcloud.controllers;

import com.example.tortcloud.models.Users;
import com.example.tortcloud.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class UserFrontController {

    @Autowired
    private UserService userService;

    @GetMapping("/signup")
    public String registration(){
        return "signup";
    }

    @GetMapping("/main")
    public String mainWindow(Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        return "main";
    }

    @GetMapping("/main/{uuid}")
    public String folder(@PathVariable String uuid, Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        return "folder";
    }
}