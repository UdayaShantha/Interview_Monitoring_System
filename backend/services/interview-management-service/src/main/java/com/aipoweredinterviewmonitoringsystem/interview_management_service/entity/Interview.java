package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.sql.Timestamp;
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

    @Column(name = "schedule_date")
    private Timestamp scheduleDate;

    @Column(name = "status")
    private String status;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "created_at")
    private Timestamp createdAt;





}
