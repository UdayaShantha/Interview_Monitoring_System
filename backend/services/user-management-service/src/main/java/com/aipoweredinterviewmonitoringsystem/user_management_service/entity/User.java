package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;



import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;


    @Column(name = "user_name",nullable = false,unique = true)
    private String username;

    @Column(name = "password",nullable = false)

    private String password;

    @NotNull(message = "User type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name="user_type",nullable = false)
    private UserType userType;


    @Column(name="created_date",nullable = false)
    private LocalDateTime createdAt;

}
