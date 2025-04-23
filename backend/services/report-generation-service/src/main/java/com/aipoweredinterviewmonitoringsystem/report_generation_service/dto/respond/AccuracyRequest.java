package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AccuracyRequest {

    @JsonProperty("interview_id")
    private Long interviewId;
    @JsonProperty("total_questions")
    private int totalQuestions;

    @JsonProperty("confident")
    private int confident;
    @JsonProperty("Neutral")
    private int Neutral;
    @JsonProperty("Surprise")
    private int Surprise;
    @JsonProperty("Fear")
    private int Fear;
    @JsonProperty("Others")
    private int Others;

    @JsonProperty("accuracy_data")
    private List<AccuracyData> accuracyData;

    public AccuracyRequest(Long interviewId, int totalQuestions, int confident, int neutral, int surprise, int fear, int others, List<AccuracyData> accuracyData) {
        this.interviewId = interviewId;
        this.totalQuestions = totalQuestions;
        this.confident = confident;
        Neutral = neutral;
        Surprise = surprise;
        Fear = fear;
        Others = others;
        this.accuracyData = accuracyData;
    }

    public AccuracyRequest() {
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getConfident() {
        return confident;
    }

    public void setConfident(int confident) {
        this.confident = confident;
    }

    public int getSurprise() {
        return Surprise;
    }

    public void setSurprise(int surprise) {
        Surprise = surprise;
    }

    public int getNeutral() {
        return Neutral;
    }

    public void setNeutral(int neutral) {
        Neutral = neutral;
    }

    public int getFear() {
        return Fear;
    }

    public void setFear(int fear) {
        Fear = fear;
    }

    public int getOthers() {
        return Others;
    }

    public void setOthers(int others) {
        Others = others;
    }

    public List<AccuracyData> getAccuracyData() {
        return accuracyData;
    }

    public void setAccuracyData(List<AccuracyData> accuracyData) {
        this.accuracyData = accuracyData;
    }

    //    public AccuracyRequest(Long interviewId, int totalQuestions, List<AccuracyData> accuracyData) {
//        this.interviewId = interviewId;
//        this.totalQuestions = totalQuestions;
//        this.accuracyData = accuracyData;
//    }
//
//    public AccuracyRequest() {
//    }
//
//    public Long getInterviewId() {
//        return interviewId;
//    }
//
//    public void setInterviewId(Long interviewId) {
//        this.interviewId = interviewId;
//    }
//
//    public int getTotalQuestions() {
//        return totalQuestions;
//    }
//
//    public void setTotalQuestions(int totalQuestions) {
//        this.totalQuestions = totalQuestions;
//    }
//
//    public List<AccuracyData> getAccuracyData() {
//        return accuracyData;
//    }
//
//    public void setAccuracyData(List<AccuracyData> accuracyData) {
//        this.accuracyData = accuracyData;

//}
//    }
}
