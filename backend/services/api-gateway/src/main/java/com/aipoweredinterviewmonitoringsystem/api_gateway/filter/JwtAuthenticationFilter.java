package com.aipoweredinterviewmonitoringsystem.api_gateway.filter;

import com.aipoweredinterviewmonitoringsystem.api_gateway.util.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();
        logger.info("Processing request for path: {}", path);

        // Allow unauthenticated access to /auth endpoints
        if (path.startsWith("/api/v1/auth/") ||
                path.startsWith("/api/v1/interviews/get/interview/questions") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui")) {
            logger.info("Allowing unauthenticated access to /auth endpoint");
            return chain.filter(exchange);
        }

        // Check for Authorization header
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null) {
            logger.warn("Authorization header is missing");
            return unauthorizedResponse(exchange);
        }
        if (!authHeader.startsWith("Bearer ")) {
            logger.warn("Authorization header does not start with 'Bearer '");
            return unauthorizedResponse(exchange);
        }

        // Extract and validate token
        String token = authHeader.substring(7);
        logger.info("Extracted token: {}", token);

        try {
            logger.info("Attempting to validate token...");
            Claims claims = jwtTokenUtil.validateToken(token);
            if (claims == null) {
                logger.warn("Token validation failed: claims are null");
                return unauthorizedResponse(exchange);
            }
            logger.info("Token validated successfully. Subject: {}", claims.getSubject());

            if (jwtTokenUtil.isTokenExpired(claims)) {
                logger.warn("Token is expired. Expiration: {}", claims.getExpiration());
                return unauthorizedResponse(exchange);
            }

            String username = claims.getSubject();
            String userType = claims.get("userType", String.class);
            logger.info("Extracted claims - Username: {}, UserType: {}", username, userType);

            // Role-based access control
            if (!isAuthorizedForPath(path, userType, claims)) {
                logger.warn("User with role {} is not authorized for path {}", userType, path);
                return forbiddenResponse(exchange);
            }

            // Modify request with headers
            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(exchange.getRequest().mutate()
                            .header("X-User-Name", username)
                            .header("X-User-Type", userType)
                            .header("Authorization", authHeader) // Optional: pass token if needed
                            .build())
                    .build();

            logger.info("Request modified with headers, proceeding to next filter");
            return chain.filter(modifiedExchange);
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return unauthorizedResponse(exchange);
        }
    }

    // Role-based access control logic
    private boolean isAuthorizedForPath(String path, String userType, Claims claims) {
        if ("SERVICE".equals(userType)) {
            // Extract scopes from claims (assumes scopes are space-separated)
            String scopes = claims.get("scopes", String.class);
            if (scopes == null) {
                logger.warn("Scopes claim is missing for SERVICE userType");
                return false;
            }

            // Define scope-based access rules
            if (path.startsWith("/api/v1/interviews/") && scopes.contains("read:interviews")) {
                return true;
            }
            if (path.startsWith("/api/v1/users/hr/get/candidate/photos") && scopes.contains("read:interviews")) {
                return true;
            }
            if (path.startsWith("/api/v1/interviews/get/interview/questions") && scopes.contains("read:questions")) {
                return true;
            }

            // Add more scope-based rules as needed
            return false;
        } else {
            // Existing user-based logic
            if (path.startsWith("/api/v1/users/hr") && !"HR".equals(userType)) {
                if (path.startsWith("/api/v1/users/hr/candidate/position/") && "CANDIDATE".equals(userType)) {
                    return true;
                }
                if (path.startsWith("/api/v1/users/hr/get/candidate/photos") && "CANDIDATE".equals(userType)) {
                    return true;
                }
                return false;
            }
            if (path.startsWith("/api/v1/interviews/") && !("TECHNICAL".equals(userType) || "HR".equals(userType))) {
                if (path.startsWith("/api/v1/interviews/get/interview-id/") && "CANDIDATE".equals(userType)) {
                    return true;
                }
                if (path.startsWith("/api/v1/interviews/update/interview/duration") && "CANDIDATE".equals(userType)) {
                    return true;
                }
                return false;
            }
            if (path.startsWith("/api/v1/users/candidate/") && !"CANDIDATE".equals(userType)) {
                return false;
            }
            if (path.startsWith("/api/v1/questions/get/interview/questions") &&
                    ("TECHNICAL".equals(userType) || "HR".equals(userType) || "CANDIDATE".equals(userType))) {
                return true;
            }
            if (path.startsWith("/api/v1/questions") && !"TECHNICAL".equals(userType)) {
                return false;
            }

            return true;
        }
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        logger.warn("Returning 401 Unauthorized response");
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbiddenResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        logger.warn("Returning 403 Forbidden response");
        return exchange.getResponse().setComplete();
    }
}