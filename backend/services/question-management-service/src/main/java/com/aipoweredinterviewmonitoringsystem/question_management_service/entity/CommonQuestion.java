package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "common_question")
public class CommonQuestion extends Question {

    @Column(name = "duration", nullable = false)
    private long duration;

    @Column(name="common_question_content",nullable = false,unique = true)
    private String content;

    @Column(name = "common_keywords", nullable = false)
    private String keywords;

    public void setKeywords(List<String> keywords) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            this.keywords = objectMapper.writeValueAsString(keywords);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize keywords", e);
        }
    }

//    public List<String> getKeywords() {
//        try {
//            ObjectMapper objectMapper = new ObjectMapper();
//            return this.keywords == null ? new ArrayList<>() : objectMapper.readValue(this.keywords, new TypeReference<List<String>>() {});
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException("Failed to deserialize keywords", e);
//        }
//    }
}