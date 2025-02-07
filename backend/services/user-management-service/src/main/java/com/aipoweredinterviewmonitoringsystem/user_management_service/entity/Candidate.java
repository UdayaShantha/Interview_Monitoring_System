package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;



import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @Min(1)
    @Max(5)
    @Column(name = "candidate_rating")
    private Integer rate;

    @Column(name = "candidate_comment")
    private String comment;

//    @OneToOne(mappedBy = "candidate")
//    private Interview interview;

//    @OneToOne(mappedBy = "candidate")
//    @JsonIgnore
//    private Interview interview;
}

