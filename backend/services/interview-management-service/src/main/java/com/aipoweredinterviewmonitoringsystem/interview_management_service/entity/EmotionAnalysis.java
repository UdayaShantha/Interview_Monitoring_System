package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "emotion_analysis")

public class EmotionAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "emotion_result")
    private String emotionResult;

    @Column(name = "confidence_score" ,length = 4)
    private int confidenceScore ;

    @OneToOne
    @JoinColumn(name = "interview_id" , nullable = false)
    private Interview interview;

    public EmotionAnalysis() {
    }

    public EmotionAnalysis(Long analysisId, String emotionResult, int confidenceScore, Interview interview) {
        this.analysisId = analysisId;
        this.emotionResult = emotionResult;
        this.confidenceScore = confidenceScore;
        this.interview = interview;
    }

    public Long getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(Long analysisId) {
        this.analysisId = analysisId;
    }

    public String getEmotionResult() {
        return emotionResult;
    }

    public void setEmotionResult(String emotionResult) {
        this.emotionResult = emotionResult;
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
        return "EmotionAnalysis{" +
                "analysisId=" + analysisId +
                ", emotionResult='" + emotionResult + '\'' +
                ", confidenceScore=" + confidenceScore +
                ", interview=" + interview +
                '}';
    }
}
