package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InterviewSaveDTO {
    private Long candidateId;
    private LocalDate scheduleDate;
    private LocalTime startTime;
}
