package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_QA")

public class QuestionQA extends Question{

//    ----------Question table is already extended------------
//    @OneToOne
//    @JoinColumn(name = "question_id")
//    @MapsId
//    private Question question;

    @Column(name = "duration", nullable = false)
    private long duration;

    //@Lob
    @Column(columnDefinition = "TEXT",name="qa_question_content",nullable = false,unique = true)
    private String content;

//    @Lob
//    @Column(name="qa_keywords",nullable = false)
//    private List<String> keywords;

//    public Question getQuestion() {
//        return question;
//    }

    public long getDuration() {
        return duration;
    }

    public String getContent() {
        return content;
    }

//    public List<String> getKeywords() {
//        return keywords;
//    }

    @Column(name = "qa_keywords", nullable = false)
    private String keywords; // This will store JSON

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

