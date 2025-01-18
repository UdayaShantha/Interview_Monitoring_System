package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "questions")

public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @Column(name="category",nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType category;

//    @Column(name = "created_by", nullable = false)
//    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}