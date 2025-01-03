package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InterviewDTO {
    private Long interviewId;
    private Timestamp scheduleDate;
    private String status;
    private String startTime;
    private Timestamp createdAt;
}
