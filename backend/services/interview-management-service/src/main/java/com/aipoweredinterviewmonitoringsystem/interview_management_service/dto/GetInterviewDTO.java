package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.ScheduleDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GetInterviewDTO {
    private double duration;
    private LocalDate scheduleDate;
    private LocalTime startTime;
}
