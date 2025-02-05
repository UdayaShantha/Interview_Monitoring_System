package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_QA")

public class QuestionQA extends Question{

    @Column(name = "duration", nullable = false)
    private long duration;

    @Column(name="qa_question_content",nullable = false,unique = true)
    private String content;

    @Column(name = "qa_keywords", nullable = false)
    private String keywords;

    public void setKeywords(List<String> keywords) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            this.keywords = objectMapper.writeValueAsString(keywords); // Serialize list to JSON
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize keywords", e);
        }
    }

    public List<String> getKeywords() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return this.keywords == null ? new ArrayList<>() : objectMapper.readValue(this.keywords, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize keywords", e);
        }
    }
}