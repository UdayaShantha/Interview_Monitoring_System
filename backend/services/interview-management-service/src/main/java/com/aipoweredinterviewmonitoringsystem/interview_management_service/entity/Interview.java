package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;

import java.sql.Time;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "interview")

public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Long interviewId;

    @Column(name = "candidate_id" , nullable = false)
    private Long candidateId;

    @Column(name = "schedule_date")
    private Timestamp scheduleDate;

    @Column(name = "status")
    private String status;

    @Column(name = "duration")
    private Time duration;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @OneToOne(mappedBy = "interview")
    private EmotionAnalysis emotionAnalysis;

    @OneToOne(mappedBy = "interview")
    private FaceRecognition faceRecognition;

    @OneToMany(mappedBy = "interview")
    private List<SpeechAnalysis> speechAnalysis;

    @OneToOne(mappedBy = "interview")
    private BodyLanguageAnalysis bodyLanguageAnalysis;

    public Interview() {}

    public Interview(Long interviewId, Long candidateId, Timestamp scheduleDate, String status, Time duration, Timestamp createdAt) {
        this.interviewId = interviewId;
        this.candidateId = candidateId;
        this.scheduleDate = scheduleDate;
        this.status = status;
        this.duration = duration;
        this.createdAt = createdAt;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Timestamp getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(Timestamp scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Time getDuration() {
        return duration;
    }

    public void setDuration(Time duration) {
        this.duration = duration;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Interview{" +
                "interviewId=" + interviewId +
                ", candidateId=" + candidateId +
                ", scheduleDate=" + scheduleDate +
                ", status='" + status + '\'' +
                ", duration=" + duration +
                ", createdAt=" + createdAt +
                '}';
    }
}
