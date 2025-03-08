package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto;

public class AnswerAccuracyDTO {
    private Long questionId;
    private int accuracy;

    public AnswerAccuracyDTO(Long questionId, int accuracy) {
        this.questionId = questionId;
        this.accuracy = accuracy;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public int getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(int accuracy) {
        this.accuracy = accuracy;
    }
}
