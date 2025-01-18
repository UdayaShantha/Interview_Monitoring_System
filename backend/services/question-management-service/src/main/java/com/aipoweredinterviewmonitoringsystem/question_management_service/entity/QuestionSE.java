package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_SE")

public class QuestionSE extends Question{
    @OneToOne
    @JoinColumn(name = "question_id")
    @MapsId
    private Question question;

    @Column(name = "duration", nullable = false)
    private long duration;

    @Lob
    @Column(columnDefinition = "TEXT",name="se_question_content",nullable = false,unique = true)
    private String content;

    @Lob
    @Column(name="se_keywords",nullable = false)
    private List<String> keywords;

    public Question getQuestion() {
        return question;
    }

    public long getDuration() {
        return duration;
    }

    public String getContent() {
        return content;
    }

    public List<String> getKeywords() {
        return keywords;
    }
}

