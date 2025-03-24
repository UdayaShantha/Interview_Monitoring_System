package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TechnicalSaveDTO {
    private String username;
    private String password;
    private String name;
    private String specialization;
    private int experienceYears;
}
