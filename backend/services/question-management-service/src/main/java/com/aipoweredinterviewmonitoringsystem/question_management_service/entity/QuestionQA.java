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
@Table(name = "question_QA")

public class QuestionQA extends Question{
    @OneToOne
    @JoinColumn(name = "question_id")
    @MapsId
    private Question question;

    @Column(name = "duration", nullable = false)
    private Long duration;

    @Lob
    @Column(columnDefinition = "TEXT",name="qa_question_content",nullable = false,unique = true)
    private String content;

    @Lob
    @Column(name="qa_keywords",nullable = false)
    private List<String> qaKeywords;
}

