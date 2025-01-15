//package com.aipoweredinterviewmonitoringsystem.user_management_service.config;
//
//import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
//import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Component;
//
//@Component
//public class CustomUserDetailsService implements UserDetailsService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        User credential = userRepository.findByUsername(username);// Fetch user by username from the database
//        if (credential == null) {
//            throw new UsernameNotFoundException("Username not found");
//        }
//        return new CustomeUserDetails(credential);
//    }
//}
