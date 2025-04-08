package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AccuracyRequest {

    @JsonProperty("interview_id")
    private Long interviewId;
    @JsonProperty("total_questions")
    private int totalQuestions;
    @JsonProperty("accuracy_data")
    private List<AccuracyData> accuracyData;

    public AccuracyRequest(Long interviewId, int totalQuestions, List<AccuracyData> accuracyData) {
        this.interviewId = interviewId;
        this.totalQuestions = totalQuestions;
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

    public List<AccuracyData> getAccuracyData() {
        return accuracyData;
    }

    public void setAccuracyData(List<AccuracyData> accuracyData) {
        this.accuracyData = accuracyData;
    }
}
