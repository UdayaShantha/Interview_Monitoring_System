package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Client findByClientId(String clientId);
}