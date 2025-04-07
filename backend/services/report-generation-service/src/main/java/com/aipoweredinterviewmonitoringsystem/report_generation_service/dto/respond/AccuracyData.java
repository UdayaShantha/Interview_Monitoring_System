package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AccuracyData {
    //@JsonProperty("question_id")
    private Long question_id;
    private String content;
    private List<String> keywords;
    private String answer;
    private double accuracy;

    public AccuracyData(Long question_id, String content, List<String> keywords, String answer, double accuracy) {
        this.question_id = question_id;
        this.content = content;
        this.keywords = keywords;
        this.answer = answer;
        this.accuracy = accuracy;
    }

    public AccuracyData() {
    }

    public Long getQuestion_id() {
        return question_id;
    }

    public void setQuestion_id(Long question_id) {
        this.question_id = question_id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }


}
