package com.aipoweredinterviewmonitoringsystem.report_generation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "report")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String emotionAnalysis;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String speechAnalysis;

    @Column(nullable = false)
    private Boolean faceVerification;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

}