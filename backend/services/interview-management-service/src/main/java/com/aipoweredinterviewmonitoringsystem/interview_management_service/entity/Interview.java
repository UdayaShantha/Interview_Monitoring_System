package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.aspectj.weaver.patterns.TypePatternQuestions;
import org.springframework.context.annotation.Profile;


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
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private long interviewId;

//    @OneToOne(cascade = CascadeType.ALL)
//    @JoinColumn(name = "candidate", referencedColumnName = "user_id",nullable = false,unique = true)
//    private Candidate candidate;

    @Column(name = "candidate_id", nullable = false, unique = true)
    private long candidateId;

    @Column(name = "schedule_date",nullable = false)
    private LocalDate scheduleDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false)
    private Status status;

    @Column(name = "start_time",nullable = false)
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
