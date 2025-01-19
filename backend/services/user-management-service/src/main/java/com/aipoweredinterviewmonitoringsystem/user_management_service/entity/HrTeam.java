package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "hr_team")
public class HrTeam extends User{

    @Column(name = "hr_name",nullable = false)
    private String name;

    @Column(name = "hr_position",nullable = false)
    private String position;

    @Column(name = "hr_comment",length =255)
    private String comment;
}
