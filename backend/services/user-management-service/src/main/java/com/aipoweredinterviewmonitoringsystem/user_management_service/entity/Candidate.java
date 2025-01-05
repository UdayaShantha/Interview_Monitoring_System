package com.aipoweredinterviewmonitoringsystem.user_management_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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

    @NotBlank(message = "Name cannot be blank")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "\\d{10}", message = "Phone number must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "NIC cannot be blank")
    @Size(max = 20, message = "NIC cannot exceed 20 characters")
    private String nic;

    @NotBlank(message = "Address cannot be blank")
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Birthday cannot be null")
    @Past(message = "Birthday must be a past date")
    private LocalDate birthday;

    @NotBlank(message = "Position cannot be blank")
    @Size(max = 50, message = "Position cannot exceed 50 characters")
    private String position;

    @NotNull(message = "Created by cannot be null")
    @Column(name = "created_by")
    private Long createdBy;

    @ElementCollection
    @CollectionTable(name = "candidate_photos")
    private List<byte[]> photos;
}
