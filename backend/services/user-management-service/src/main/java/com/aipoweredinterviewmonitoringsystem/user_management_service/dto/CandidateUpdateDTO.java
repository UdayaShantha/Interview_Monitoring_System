package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CandidateUpdateDTO {

    private String username;
    private String password;

    private String name;
    private String nic;
    private String email;
    private String address;
    private String phone;
    private LocalDate birthday;
    private PositionType positionType;

}
