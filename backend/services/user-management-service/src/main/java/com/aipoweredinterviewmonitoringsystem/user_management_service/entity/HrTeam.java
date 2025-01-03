package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "hr_team")
public class HrTeam {
    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @MapsId
    private User user;

    private String name;
    private String department;
    private String position;
}
