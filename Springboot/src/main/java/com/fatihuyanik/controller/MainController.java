package com.fatihuyanik.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    // http://localhost:8080/login
    @GetMapping("/login")
    public String login() {
        return "login";
    }

    // http://localhost:8080/
    @GetMapping("/")
    public String index() {
        return "index";
    }
}
