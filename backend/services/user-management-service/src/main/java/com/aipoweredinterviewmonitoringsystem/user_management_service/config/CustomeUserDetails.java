//package com.aipoweredinterviewmonitoringsystem.user_management_service.config;
//
//import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import java.util.Collection;
//import java.util.List;
//
//public class CustomeUserDetails implements UserDetails {
//
//    private String username;
//    private String password;
//
//    // Initialize user details from the User entity
//    public CustomeUserDetails(User user) {
//        this.username = user.getUsername();
//        this.password = user.getPassword();
//
//    }
//
//    // Define user roles/authorities
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of();
//    }
//
//    @Override
//    public String getPassword() {
//        return password;
//    }
//
//    @Override
//    public String getUsername() {
//        return username;
//    }
//
//    @Override
//    public boolean isAccountNonExpired() {
//        return UserDetails.super.isAccountNonExpired();
//    }
//
//    @Override
//    public boolean isAccountNonLocked() {
//        return UserDetails.super.isAccountNonLocked();
//    }
//
//    @Override
//    public boolean isCredentialsNonExpired() {
//        return UserDetails.super.isCredentialsNonExpired();
//    }
//
//    @Override
//    public boolean isEnabled() {
//        return UserDetails.super.isEnabled();
//    }
//}
