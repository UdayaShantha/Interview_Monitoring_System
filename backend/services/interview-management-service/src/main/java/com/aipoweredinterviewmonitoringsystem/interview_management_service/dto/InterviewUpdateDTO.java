package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InterviewUpdateDTO {
    private LocalTime startTime;
    private double duration;
    private Status status;
    private LocalDate scheduleDate;
}
