package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "common_question")
public class CommonQuestion extends Question {

    @OneToOne
    @JoinColumn(name = "question_id")
    @MapsId
    private Question question;

    @Column(name = "duration", nullable = false)
    private Long duration;

    @Lob
    @Column(columnDefinition = "TEXT",name="common_question_content",nullable = false,unique = true)
    private String content;

    @Lob
    @Column(name="common_keywords",nullable = false)
    private List<String> commonKeywords;

}

