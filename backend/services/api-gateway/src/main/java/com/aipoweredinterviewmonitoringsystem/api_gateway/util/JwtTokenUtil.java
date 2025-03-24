package com.aipoweredinterviewmonitoringsystem.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenUtil {

    // Must match User Management Service (64+ bytes)
    private static final String SECRET_KEY = "this-is-a-very-long-secret-key-that-is-at-least-64-bytes-long-for-hs512";

    public Claims validateToken(String token) {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        var signingKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }
}