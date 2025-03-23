package com.aipoweredinterviewmonitoringsystem.user_management_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenUtil {

    private static final String SECRET_KEY = "this-is-a-very-long-secret-key-that-is-at-least-64-bytes-long-for-hs512";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours in milliseconds

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userType = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userType", userType)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    public Claims validateToken(String token) {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(keyBytes))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }
}