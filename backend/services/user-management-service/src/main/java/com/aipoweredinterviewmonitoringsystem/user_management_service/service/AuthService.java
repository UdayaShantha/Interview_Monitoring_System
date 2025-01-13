package com.aipoweredinterviewmonitoringsystem.user_management_service.service;


import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String saveUser(User user){
        User existingUser = userRepository.findByUsername(user.getUsername());
        if(existingUser != null){
            return "User already exists";
        }
        // Hash the password and save the user
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Always set userType to CANDIDATE
        //user.setUserType(User.UserType.CANDIDATE);
        userRepository.save(user);
        return "User saved successfully";
    }

    public String generateToken(String username){
        User user = userRepository.findByUsername(username);
        if(user == null){
            return "User not found";
        }
        return jwtService.generateToken(username,user.getUserType());
    }

    public void validateToken(String token){
        jwtService.validateToken(token);
    }

}
