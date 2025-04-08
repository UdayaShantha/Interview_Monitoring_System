package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond;

public class InterviewMetricsDto {
    private Double interviewDurationSeconds;
    private Double offScreenDurationSeconds;
    private Double averageHeadRotationDegrees;

    // DeepFace Analysis
    private Double angryPercentage;
    private Double disgustPercentage;
    private Double fearPercentage;
    private Double happyPercentage;
    private Double sadPercentage;
    private Double surprisePercentage;
    private Double neutralPercentage;

    private Integer analyzedFrames;
    private Integer validFaceDetections;

    public InterviewMetricsDto(Double interviewDurationSeconds, Double offScreenDurationSeconds, Double averageHeadRotationDegrees, Double angryPercentage, Double disgustPercentage, Double fearPercentage, Double happyPercentage, Double sadPercentage, Double surprisePercentage, Double neutralPercentage, Integer analyzedFrames, Integer validFaceDetections) {
        this.interviewDurationSeconds = interviewDurationSeconds;
        this.offScreenDurationSeconds = offScreenDurationSeconds;
        this.averageHeadRotationDegrees = averageHeadRotationDegrees;
        this.angryPercentage = angryPercentage;
        this.disgustPercentage = disgustPercentage;
        this.fearPercentage = fearPercentage;
        this.happyPercentage = happyPercentage;
        this.sadPercentage = sadPercentage;
        this.surprisePercentage = surprisePercentage;
        this.neutralPercentage = neutralPercentage;
        this.analyzedFrames = analyzedFrames;
        this.validFaceDetections = validFaceDetections;
    }

    public InterviewMetricsDto() {
    }

    public Double getInterviewDurationSeconds() {
        return interviewDurationSeconds;
    }

    public void setInterviewDurationSeconds(Double interviewDurationSeconds) {
        this.interviewDurationSeconds = interviewDurationSeconds;
    }

    public Double getOffScreenDurationSeconds() {
        return offScreenDurationSeconds;
    }

    public void setOffScreenDurationSeconds(Double offScreenDurationSeconds) {
        this.offScreenDurationSeconds = offScreenDurationSeconds;
    }

    public Double getAverageHeadRotationDegrees() {
        return averageHeadRotationDegrees;
    }

    public void setAverageHeadRotationDegrees(Double averageHeadRotationDegrees) {
        this.averageHeadRotationDegrees = averageHeadRotationDegrees;
    }

    public Double getAngryPercentage() {
        return angryPercentage;
    }

    public void setAngryPercentage(Double angryPercentage) {
        this.angryPercentage = angryPercentage;
    }

    public Double getDisgustPercentage() {
        return disgustPercentage;
    }

    public void setDisgustPercentage(Double disgustPercentage) {
        this.disgustPercentage = disgustPercentage;
    }

    public Double getFearPercentage() {
        return fearPercentage;
    }

    public void setFearPercentage(Double fearPercentage) {
        this.fearPercentage = fearPercentage;
    }

    public Double getHappyPercentage() {
        return happyPercentage;
    }

    public void setHappyPercentage(Double happyPercentage) {
        this.happyPercentage = happyPercentage;
    }

    public Double getSadPercentage() {
        return sadPercentage;
    }

    public void setSadPercentage(Double sadPercentage) {
        this.sadPercentage = sadPercentage;
    }

    public Double getSurprisePercentage() {
        return surprisePercentage;
    }

    public void setSurprisePercentage(Double surprisePercentage) {
        this.surprisePercentage = surprisePercentage;
    }

    public Double getNeutralPercentage() {
        return neutralPercentage;
    }

    public void setNeutralPercentage(Double neutralPercentage) {
        this.neutralPercentage = neutralPercentage;
    }

    public Integer getAnalyzedFrames() {
        return analyzedFrames;
    }

    public void setAnalyzedFrames(Integer analyzedFrames) {
        this.analyzedFrames = analyzedFrames;
    }

    public Integer getValidFaceDetections() {
        return validFaceDetections;
    }

    public void setValidFaceDetections(Integer validFaceDetections) {
        this.validFaceDetections = validFaceDetections;
    }
}
