package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InterviewStatusPresentageDTO {
    private Status status;
    private double percentage;
}
