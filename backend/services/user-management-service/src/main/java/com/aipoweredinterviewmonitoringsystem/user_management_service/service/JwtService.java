//package com.aipoweredinterviewmonitoringsystem.user_management_service.service;
//
//import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jws;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.io.Decoders;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.stereotype.Service;
//
//import java.security.Key;
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//public class JwtService {
//
//    public static final String SECRET = "7EF9DA281D72FEDC3A6448938821925152EDE70D9DA777CD7B77C8DD1505532A";
//
//    public void validateToken(final String token){
//        // Validates the JWT token
//        Jws<Claims> claimsJws = Jwts.parserBuilder()
//                .setSigningKey(getSignKey())
//                .build()
//                .parseClaimsJws(token);
//    }
//
//    public String generateToken(String userName,User.UserType userType){
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("userType",userType);
//        return createToken(claims, userName);
//    }
//
//    public String createToken(Map<String , Object> claims, String userName){
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(userName)
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30))
//                .signWith(getSignKey(), SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    private Key getSignKey(){
//        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
//        return Keys.hmacShaKeyFor(keyBytes);
//    }
//
//    // Extracts all claims (payload) from the token
//    public Claims extractClaims(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(getSignKey()) // Use signing key
//                .build()
//                .parseClaimsJws(token) // Parse token
//                .getBody(); // Get claims
//    }
//
//    // Extracts the username (subject) from the token
//    public String getUsernameFromToken(String token) {
//        return extractClaims(token).getSubject();
//    }
//
//    // Extracts the userType claim from the token
//    public String getUserTypeFromToken(String token) {
//        return (String) extractClaims(token).get("userType");
//    }
//}
