package com.example.tortcloud.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserFrontController {

    @GetMapping("/signup")
    public String registration(){
        return "signup";
    }
}