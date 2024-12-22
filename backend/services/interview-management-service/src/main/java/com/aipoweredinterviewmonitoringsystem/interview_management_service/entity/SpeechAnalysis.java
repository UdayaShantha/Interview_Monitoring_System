package com.aipoweredinterviewmonitoringsystem.interview_management_service.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "speech_analysis")

public class SpeechAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "speech_id")
    private Long speechId;

    @Column(name = "speech_result")
    private String speechResult;

    @Column(name = "clarity_score")
    private int clarityScore;

    @Column(name = "question_id")
    private Long questionId;

    @ManyToOne
    @JoinColumn(name = "interview_id" , nullable = false)
    private Interview interview;

    public SpeechAnalysis() {
    }

    public SpeechAnalysis(Long speechId, String speechResult, int clarityScore, Long questionId, Interview interview) {
        this.speechId = speechId;
        this.speechResult = speechResult;
        this.clarityScore = clarityScore;
        this.questionId = questionId;
        this.interview = interview;
    }

    public Long getSpeechId() {
        return speechId;
    }

    public void setSpeechId(Long speechId) {
        this.speechId = speechId;
    }

    public String getSpeechResult() {
        return speechResult;
    }

    public void setSpeechResult(String speechResult) {
        this.speechResult = speechResult;
    }

    public int getClarityScore() {
        return clarityScore;
    }

    public void setClarityScore(int clarityScore) {
        this.clarityScore = clarityScore;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    @Override
    public String toString() {
        return "SpeechAnalysis{" +
                "speechId=" + speechId +
                ", speechResult='" + speechResult + '\'' +
                ", clarityScore=" + clarityScore +
                ", questionId=" + questionId +
                ", interview=" + interview +
                '}';
    }
}
