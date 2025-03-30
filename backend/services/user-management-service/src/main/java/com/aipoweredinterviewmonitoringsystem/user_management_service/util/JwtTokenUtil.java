package com.aipoweredinterviewmonitoringsystem.user_management_service.util;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Client;
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
    private static final long ACCESS_TOKEN_EXPIRATION = 86400000; // 24 hours in milliseconds
    private static final long REFRESH_TOKEN_EXPIRATION = 604800000; // 7 days in milliseconds

    public String generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userType = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(userDetails.getUsername()) // Replaces .setSubject()
                .claim("userType", userType)
                .issuedAt(new Date()) // Replaces .setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION)) // Replaces .setExpiration()
                .signWith(signingKey, Jwts.SIG.HS512) // New signWith syntax
                .compact();
    }

    public String generateRefreshToken(String username) {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }

    public Claims validateToken(String token) {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parser() // No longer supports parserBuilder()
                .verifyWith(signingKey) // Correct way to verify signature
                .build()
                .parseSignedClaims(token) // Use parseSignedClaims instead of parseClaimsJws
                .getPayload();
    }

    public boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public String getUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject();
    }

    public String generateClientToken(Client client) {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(client.getClientId())
                .claim("scopes", client.getScopes())
                .claim("userType", "SERVICE") // Optional: distinguish service tokens
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(signingKey, Jwts.SIG.HS512)
                .compact();
    }
}
