package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    RefreshToken findByToken(String token);
    void deleteByToken(String token);
}