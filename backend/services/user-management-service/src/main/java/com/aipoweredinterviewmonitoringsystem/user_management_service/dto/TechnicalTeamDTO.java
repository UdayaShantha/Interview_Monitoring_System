package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TechnicalTeamDTO {

    private User user;
    private String name;
    private String specialization;
    private int experienceYears;
    private String comment;
}
