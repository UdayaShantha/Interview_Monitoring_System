package com.example.reportgenerationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String emotionAnalysis;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String speechAnalysis;

    @Column(nullable = false)
    private Boolean faceVerification;

    @Column(nullable = false)
    private Double score;

     @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public String getEmotionAnalysis() {
        return emotionAnalysis;
    }

      public void setEmotionAnalysis(String emotionAnalysis) {
        this.emotionAnalysis = emotionAnalysis;
    }

    public String getSpeechAnalysis() {
        return speechAnalysis;
    }

    public void setSpeechAnalysis(String speechAnalysis) {
        this.speechAnalysis = speechAnalysis;
    }

    public Boolean getFaceVerification() {
        return faceVerification;
    }

    public void setFaceVerification(Boolean faceVerification) {
        this.faceVerification = faceVerification;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

     public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}