package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.LoginRequest;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.RefreshTokenRequest;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Client;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.RefreshToken;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.ClientRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.RefreshTokenRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.CustomUserDetails;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.CustomUserDetailsService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.JwtTokenUtil;
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
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final ClientRepository clientRepository;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenUtil jwtTokenUtil,
                          RefreshTokenRepository refreshTokenRepository,
                          CustomUserDetailsService customUserDetailsService,
                          ClientRepository clientRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.refreshTokenRepository = refreshTokenRepository;
        this.customUserDetailsService = customUserDetailsService;
        this.clientRepository = clientRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Long userId = 0L;
            if (authentication.getPrincipal() instanceof CustomUserDetails) {
                userId = ((CustomUserDetails) authentication.getPrincipal()).getUserId();
            }

            String accessToken = jwtTokenUtil.generateAccessToken(authentication);
            String refreshToken = jwtTokenUtil.generateRefreshToken(authentication.getName());

            // Store refresh token
            RefreshToken refreshTokenEntity = new RefreshToken();
            refreshTokenEntity.setToken(refreshToken);
            refreshTokenEntity.setUsername(authentication.getName());
            refreshTokenEntity.setExpiryDate(new Date(System.currentTimeMillis() + 604800000)); // 7 days
            refreshTokenRepository.save(refreshTokenEntity);

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("userId", userId.toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String oldRefreshToken = request.getRefreshToken();
            RefreshToken storedToken = refreshTokenRepository.findByToken(oldRefreshToken);

            if (storedToken == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
            }

            if (storedToken.getExpiryDate().before(new Date())) {
                refreshTokenRepository.delete(storedToken);
                return ResponseEntity.status(401).body(Map.of("error", "Refresh token expired"));
            }

            // Generate new tokens
            String username = storedToken.getUsername();
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            String newAccessToken = jwtTokenUtil.generateAccessToken(
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    )
            );
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(username);

            // Delete old and store new refresh token
            refreshTokenRepository.delete(storedToken);

            RefreshToken newRefreshTokenEntity = new RefreshToken();
            newRefreshTokenEntity.setToken(newRefreshToken);
            newRefreshTokenEntity.setUsername(username);
            newRefreshTokenEntity.setExpiryDate(new Date(System.currentTimeMillis() + 604800000));
            refreshTokenRepository.save(newRefreshTokenEntity);

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken);

        if (storedToken != null) {
            refreshTokenRepository.delete(storedToken);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid refresh token"));
    }

    @PostMapping("/client-token")
    public ResponseEntity<?> getClientToken(@RequestBody Map<String, String> request) {
        String clientId = request.get("client_id");
        String clientSecret = request.get("client_secret");

        Client client = clientRepository.findByClientId(clientId);
        if (client == null || !client.getClientSecret().equals(clientSecret)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid client credentials"));
        }

        String accessToken = jwtTokenUtil.generateClientToken(client);
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }
}