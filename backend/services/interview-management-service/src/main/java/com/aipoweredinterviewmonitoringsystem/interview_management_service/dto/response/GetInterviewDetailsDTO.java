package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GetInterviewDetailsDTO {
    private long candidateId;
    private LocalDate scheduleDate;
    private double duration;
}
