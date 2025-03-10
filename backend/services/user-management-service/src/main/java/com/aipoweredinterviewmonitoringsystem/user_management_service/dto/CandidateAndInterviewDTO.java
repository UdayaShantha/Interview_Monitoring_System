package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CandidateAndInterviewDTO {
    private String name;
    private String nic;
    private String email;
    private String address;
    private String phone;
    private PositionType positionType;

    private LocalDate scheduleDate;
    private LocalTime startTime;
    private double duration;

}
