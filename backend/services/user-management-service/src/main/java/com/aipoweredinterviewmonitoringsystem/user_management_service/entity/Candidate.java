package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "candidates")
public class Candidate extends User{

    @Column(name = "candidate_name",nullable = false)
    private String name;

    @Column(name = "candidate_nic",nullable = false, unique = true)
    private String nic;

    @Column(name = "email",nullable = false,unique = true)
    private String email;

    @Column(name = "candidate_address",nullable = false)
    private String address;

    @Column(name = "candidate_phone_number",nullable = false,unique = true)
    private String phone;

    @Column(name = "candidate_dob",nullable = false)
    private LocalDate birthday;

    @ElementCollection
    @CollectionTable(name = "candidate_photos")
    private List<byte[]> photos;

    @Enumerated(EnumType.STRING)
    @Column(name="position_type",nullable = false)
    private PositionType positionType;

    @Column(name = "start_time",nullable = false)
    private LocalTime startTime;

    @Column(name = "schedule_date",nullable = false)
    private LocalDate scheduleDate;

    public Candidate(Long userId, String username, String password, UserType userType, LocalDateTime createdAt, String name, String nic, String email, String address, String phone, LocalDate birthday, PositionType positionType, LocalTime startTime, LocalDate scheduleDate) {
        super(userId, username, password, userType, createdAt);
        this.name = name;
        this.nic = nic;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.birthday = birthday;
        this.positionType = positionType;
        this.startTime = startTime;
        this.scheduleDate = scheduleDate;
    }

    //    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "created_by", nullable = false)
//    private HrTeam createdBy;
}
