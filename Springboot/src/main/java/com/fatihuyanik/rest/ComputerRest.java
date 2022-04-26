package com.fatihuyanik.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ComputerRest {

    @GetMapping("/rest1")
    public String rest1() {
        return "rest1";
    }
}
