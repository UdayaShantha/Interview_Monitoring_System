package com.aipoweredinterviewmonitoringsystem.question_management_service.dto;


import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionSEDTO {
    private Question question;
    private Long duration;
    private String content;
    private List<String> seKeywords;
}
