package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_DS")

public class QuestionDA extends Question{
    @OneToOne
    @JoinColumn(name = "question_id")
    @MapsId
    private Question question;

    @Column(name = "duration", nullable = false)
    private Long duration;

    @Lob
    @Column(columnDefinition = "TEXT",name="da_question_content",nullable = false,unique = true)
    private String content;

    @Lob
    @Column(name="da_keywords",nullable = false)
    private List<String> daKeywords;
}

