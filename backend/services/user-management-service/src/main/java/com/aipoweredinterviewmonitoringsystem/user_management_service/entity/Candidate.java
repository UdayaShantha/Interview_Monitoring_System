package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "candidates")
public class Candidate {
    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @MapsId
    private User user;

    private String name;
    private String phone;
    private String nic;
    private String address;
    private String email;
    private LocalDate birthday;
    private String position;

    @Column(name = "created_by")
    private Long createdBy;

    @ElementCollection
    @CollectionTable(name = "candidate_photos")
    private List<byte[]> photos;

//    @ManyToOne
//    @JoinColumn(name = "created_by", insertable = false, updatable = false)
//    private HrTeam hrTeam;


}
