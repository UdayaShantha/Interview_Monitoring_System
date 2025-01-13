package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.UserLoginDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.AuthService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    // Service to handle authentication logic
    @Autowired
    private AuthService authService;

    // Handles login authentication
    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return authService.saveUser(user);
    }

    @PostMapping("/token")
    public String getToken(@RequestBody UserLoginDTO userLoginDTO) {
        Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userLoginDTO.getUsername(), userLoginDTO.getPassword()));
        if(authenticate.isAuthenticated()) {
            return authService.generateToken(userLoginDTO.getUsername());
        }else {
            throw new RuntimeException("Invalid Access");
        }
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        authService.validateToken(token);
        return "Token is valid";
    }

}
