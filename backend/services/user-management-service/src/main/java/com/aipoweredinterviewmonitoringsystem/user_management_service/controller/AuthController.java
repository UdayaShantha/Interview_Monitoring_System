package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.JwtResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.LoginRequest;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.RefreshTokenRequest;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.RefreshToken;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.RefreshTokenRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.CustomUserDetailsService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CustomUserDetailsService customUserDetailsService; // Use your existing service

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate tokens
        String accessToken = jwtTokenUtil.generateAccessToken(authentication);
        String username = authentication.getName();
        String refreshToken = jwtTokenUtil.generateRefreshToken(username);

        // Store refresh token
        RefreshToken refreshTokenEntity = new RefreshToken(
                refreshToken, username, new Date(System.currentTimeMillis() + 604800000) // 7 days
        );
        refreshTokenRepository.save(refreshTokenEntity);

        // Return both tokens
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String oldRefreshToken = request.getRefreshToken();
        RefreshToken storedToken = refreshTokenRepository.findByToken(oldRefreshToken);

        // Validate the old refresh token
        if (storedToken == null || storedToken.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(401).body("Invalid or expired refresh token");
        }

        try {
            // Validate token with JWT utility (assuming JWT-based tokens)
            Claims claims = jwtTokenUtil.validateToken(oldRefreshToken);
            if (jwtTokenUtil.isTokenExpired(claims)) {
                return ResponseEntity.status(401).body("Refresh token has expired");
            }

            // Get user details
            String username = storedToken.getUsername();
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    username, null, userDetails.getAuthorities()
            );

            // Generate new tokens
            String newAccessToken = jwtTokenUtil.generateAccessToken(authentication);
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(username);

            // Delete the old refresh token
            refreshTokenRepository.deleteByToken(oldRefreshToken);

            // Store the new refresh token
            RefreshToken newRefreshTokenEntity = new RefreshToken(
                    newRefreshToken,
                    username,
                    new Date(System.currentTimeMillis() + 604800000) // 7 days expiry
            );
            refreshTokenRepository.save(newRefreshTokenEntity);

            // Prepare response
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken);

        if (storedToken != null) {
            refreshTokenRepository.deleteByToken(refreshToken);
            return ResponseEntity.ok("Logged out successfully");
        } else {
            return ResponseEntity.status(400).body("Invalid refresh token");
        }
    }
}