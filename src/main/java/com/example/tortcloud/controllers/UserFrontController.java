package com.example.tortcloud.controllers;

import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.CompaniesRepo;
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

    @Autowired
    private CompaniesRepo companiesRepo;

    @GetMapping("/signup")
    public String registration(Model model){
        model.addAttribute("companies", companiesRepo.findAll());
        return "signup";
    }

    @GetMapping("/main")
    public String mainWindow(Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        model.addAttribute("company", users.getCompanies().getCompany());
        return "main";
    }

    @GetMapping("/main/{uuid}")
    public String folder(@PathVariable String uuid, Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        model.addAttribute("company", users.getCompanies().getCompany());
        return "folder";
    }

    @GetMapping("/trash")
    public String trashPage(Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        model.addAttribute("company", users.getCompanies().getCompany());
        return "trash";
    }

    @GetMapping("/pinned")
    public String pinPage(Model model) {
        Users users = userService.getUserFromAuth();
        model.addAttribute("username", users.getUsername());
        model.addAttribute("avatar", users.getAvatar());
        model.addAttribute("company", users.getCompanies().getCompany());
        return "pinned";
    }

    @GetMapping("/shared-folders/{uuid}")
    public String sharedFolders(@PathVariable String uuid, Model model) {
        return "shared-folders";
    }
}