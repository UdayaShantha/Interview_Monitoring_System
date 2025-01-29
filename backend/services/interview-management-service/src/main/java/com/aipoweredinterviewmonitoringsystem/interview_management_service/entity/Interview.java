package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "interview")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private long interviewId;

    @Column(name = "candidate_id", nullable = false, unique = true)
    private long candidateId;

    @Column(name = "schedule_date",nullable = false)
    private LocalDate scheduleDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false)
    private Status status;

    @Column(name = "start_time",nullable = false,unique = true)
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "interview_duration",nullable = false,columnDefinition = "double precision default 0.0")
    private double duration = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "result",nullable = false)
    private Result result;

}
