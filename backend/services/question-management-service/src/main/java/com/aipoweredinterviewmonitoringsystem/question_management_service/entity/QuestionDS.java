package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "question_DS")

public class QuestionDS {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_ds_id")
    private Long questionDSId;

    @OneToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "duration" ,nullable = false)
    private LocalTime duration;

    public void setQuestionDSId(Long id) {
        this.questionDSId = id;
    }
}