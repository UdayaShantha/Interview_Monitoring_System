package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class CandidateDTO {
    private User user;
    private String name;
    private String nic;
    private String email;
    private String address;
    private String phone;
    private LocalDate birthday;
    private List<byte[]> photos;
    private PositionType positionType;
    private LocalTime startTime;
    private LocalDate scheduleDate;

}
