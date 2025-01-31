//package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;
//
//import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.auth.AuthRequest;
//import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@CrossOrigin
//@RequestMapping("api/v1/auth")
//public class AuthConroller {
//
//    @Autowired
//    private UserService userService;
//
//    @Autowired
//    private AuthenticationManager authenticationManager;
//
//    @PostMapping("/token")
//    public String getToken(@RequestBody AuthRequest authRequest) {
//        Authentication authentication = authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
//        ;
//        if (authentication.isAuthenticated()) {
//            return userService.generateToken(authRequest.getUsername());
//        }else {
//            throw new RuntimeException("Invalid username or password");
//        }
//
//    }
//
//    @GetMapping("/validate")
//    public String validateToken(@RequestParam(value = "token") String token) {
//        userService.validateToken(token);
//        return "Token is valid";
//    }
//}
