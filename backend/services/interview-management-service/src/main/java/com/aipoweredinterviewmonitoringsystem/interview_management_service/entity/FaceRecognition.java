package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "face_recognition")

public class FaceRecognition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recognition_id")
    private Long recognitionId;

    @Column(name = "verification_result")
    private boolean verificationResult;

    @OneToOne
    @JoinColumn(name = "interview_id" , nullable = false)
    private Interview interview;

    public FaceRecognition() {
    }

    public FaceRecognition(Long recognitionId, boolean verificationResult, Interview interview) {
        this.recognitionId = recognitionId;
        this.verificationResult = verificationResult;
        this.interview = interview;
    }

    public Long getRecognitionId() {
        return recognitionId;
    }

    public void setRecognitionId(Long recognitionId) {
        this.recognitionId = recognitionId;
    }

    public boolean isVerificationResult() {
        return verificationResult;
    }

    public void setVerificationResult(boolean verificationResult) {
        this.verificationResult = verificationResult;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    @Override
    public String toString() {
        return "FaceRecognition{" +
                "recognitionId=" + recognitionId +
                ", verificationResult=" + verificationResult +
                ", interview=" + interview +
                '}';
    }
}
