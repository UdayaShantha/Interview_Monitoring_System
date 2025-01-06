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


    public String getId() {
        return "";
    }
}