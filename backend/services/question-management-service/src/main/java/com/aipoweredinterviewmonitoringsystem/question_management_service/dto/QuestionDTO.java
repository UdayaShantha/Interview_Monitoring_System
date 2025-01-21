package com.aipoweredinterviewmonitoringsystem.question_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class QuestionDTO {
    private long questionId;
    private QuestionType category;
    private LocalDateTime createdAt;

}
