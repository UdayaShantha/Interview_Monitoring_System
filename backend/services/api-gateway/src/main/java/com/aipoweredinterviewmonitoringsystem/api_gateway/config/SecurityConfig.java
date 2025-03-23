//package com.aipoweredinterviewmonitoringsystem.api_gateway.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
//@Configuration
//@EnableWebFluxSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
//        return http
//                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Disable CSRF for APIs
//                .authorizeExchange(auth -> auth
//                        .pathMatchers("api/v1/auth/login").permitAll() // Allow public endpoints
//                        .anyExchange().authenticated() // Secure all other endpoints
//                )
//                .build();
//    }
//}
