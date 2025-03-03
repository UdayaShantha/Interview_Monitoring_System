package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "technical_team")
public class TechnicalTeam extends User{

    @Column(name = "technical_name",nullable = false)
    private String name;

    @Column(name = "specialization",nullable = false)
    private String specialization;

    @Column(name = "experience",nullable = false)
    private int experienceYears;

    @Column(name = "technical_comment",length =255)
    private String comment;
}