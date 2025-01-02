package com.aipoweredinterviewmonitoringsystem.question_management_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "common_question")
public class CommonQuestion {
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long commonQuestionId;

    @OneToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "duration" ,nullable = false)
    private LocalTime duration;

    public void setCommonQuestionId(Long commonQuestionId) {
        this.commonQuestionId = commonQuestionId;
    }

}

