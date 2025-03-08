package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//@Data
//@AllArgsConstructor
//@NoArgsConstructor
public class EmotionData {
    private String emotionName;
    private Integer emotionValue;

    public EmotionData(String emotionName, Integer emotionValue) {
        this.emotionName = emotionName;
        this.emotionValue = emotionValue;
    }

    public String getEmotionName() {
        return emotionName;
    }

    public void setEmotionName(String emotionName) {
        this.emotionName = emotionName;
    }

    public Integer getEmotionValue() {
        return emotionValue;
    }

    public void setEmotionValue(Integer emotionValue) {
        this.emotionValue = emotionValue;
    }


}
