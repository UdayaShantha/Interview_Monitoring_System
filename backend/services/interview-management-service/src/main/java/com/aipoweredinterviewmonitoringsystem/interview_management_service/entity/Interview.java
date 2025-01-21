package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.ScheduleDate;
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
    private Long interviewId;

    @Column(name = "candidate_id",nullable = false)
    private Long candidateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_date",nullable = false)
    private ScheduleDate scheduleDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false)
    private Status status;

    @Column(name = "start_time",nullable = false)
    private LocalTime startTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "interview_duration",nullable = false,columnDefinition = "double precision default 0.0")
    private double duration = 0.0;


}
