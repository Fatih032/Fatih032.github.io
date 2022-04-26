package com.fatihuyanik.service;

import com.fatihuyanik.model.User;
import com.fatihuyanik.dto.UserRegistrationDto;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    User save(UserRegistrationDto registrationDto);
}