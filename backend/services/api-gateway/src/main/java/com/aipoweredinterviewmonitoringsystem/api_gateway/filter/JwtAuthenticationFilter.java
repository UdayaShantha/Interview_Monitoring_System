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
        logger.info("JwtAuthenticationFilter is executing for path: " + exchange.getRequest().getPath());
        String path = exchange.getRequest().getPath().toString();
        logger.info("Processing request for path: {}", path);

        if (path.contains("/auth/")) {
            logger.info("Allowing unauthenticated access to /auth endpoint");
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null) {
            logger.warn("Authorization header is missing");
            return unauthorizedResponse(exchange);
        }
        if (!authHeader.startsWith("Bearer ")) {
            logger.warn("Authorization header does not start with 'Bearer '");
            return unauthorizedResponse(exchange);
        }

        String token = authHeader.substring(7);
        logger.info("Extracted token: {}", token);

        try {
            logger.info("Attempting to validate token...");
            Claims claims = jwtTokenUtil.validateToken(token);
            logger.info("Token validated successfully. Subject: {}", claims.getSubject());

            if (jwtTokenUtil.isTokenExpired(claims)) {
                logger.warn("Token is expired. Expiration: {}", claims.getExpiration());
                return unauthorizedResponse(exchange);
            }

            String username = claims.getSubject();
            String userType = claims.get("userType", String.class);
            logger.info("Extracted claims - Username: {}, UserType: {}", username, userType);

            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(exchange.getRequest().mutate()
                            .header("X-User-Name", username)
                            .header("X-User-Type", userType)
                            .header("Authorization", authHeader)
                            .build())
                    .build();

            logger.info("Request modified with headers, proceeding to next filter");
            return chain.filter(modifiedExchange);
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return unauthorizedResponse(exchange);
        }
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        logger.warn("Returning 401 Unauthorized response");
        return exchange.getResponse().setComplete();
    }
}