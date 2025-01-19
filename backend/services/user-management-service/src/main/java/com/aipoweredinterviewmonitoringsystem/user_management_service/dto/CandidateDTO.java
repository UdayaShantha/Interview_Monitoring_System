package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Data
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

    public CandidateDTO(Candidate candidate, String name, String nic, String email, String address, String phone, LocalDate birthday, List<byte[]> photos, PositionType positionType) {
    }
}
