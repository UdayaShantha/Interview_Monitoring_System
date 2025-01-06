package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserType userType;

    private LocalDateTime createdAt;

    public enum UserType {
        CANDIDATE, HR, TECHNICAL
    }
}
