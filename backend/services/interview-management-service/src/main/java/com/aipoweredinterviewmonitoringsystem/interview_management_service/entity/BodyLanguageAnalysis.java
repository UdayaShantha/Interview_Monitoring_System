package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "body_language_analysis")

public class BodyLanguageAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "body_analysis_id")
    private Long bodyAnalysisId;

    @Column(name = "posture_analysis")
    private String postureAnalysis;

    @Column(name = "gesture_analysis")
    private String gestureAnalysis;

    @Column(name = "confidence_score")
    private int confidenceScore;

    @OneToOne
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    public BodyLanguageAnalysis() {

    }

    public BodyLanguageAnalysis(Long bodyAnalysisId, String postureAnalysis, String gestureAnalysis, int confidenceScore, Interview interview) {
        this.bodyAnalysisId = bodyAnalysisId;
        this.postureAnalysis = postureAnalysis;
        this.gestureAnalysis = gestureAnalysis;
        this.confidenceScore = confidenceScore;
        this.interview = interview;
    }

    public Long getBodyAnalysisId() {
        return bodyAnalysisId;
    }

    public void setBodyAnalysisId(Long bodyAnalysisId) {
        this.bodyAnalysisId = bodyAnalysisId;
    }

    public String getPostureAnalysis() {
        return postureAnalysis;
    }

    public void setPostureAnalysis(String postureAnalysis) {
        this.postureAnalysis = postureAnalysis;
    }

    public String getGestureAnalysis() {
        return gestureAnalysis;
    }

    public void setGestureAnalysis(String gestureAnalysis) {
        this.gestureAnalysis = gestureAnalysis;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(int confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    @Override
    public String toString() {
        return "BodyLanguageAnalysis{" +
                "bodyAnalysisId=" + bodyAnalysisId +
                ", postureAnalysis='" + postureAnalysis + '\'' +
                ", gestureAnalysis='" + gestureAnalysis + '\'' +
                ", confidenceScore=" + confidenceScore +
                ", interview=" + interview +
                '}';
    }
}
