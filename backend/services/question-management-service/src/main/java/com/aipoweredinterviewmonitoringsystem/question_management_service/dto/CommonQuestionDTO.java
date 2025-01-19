package com.aipoweredinterviewmonitoringsystem.question_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CommonQuestionDTO {
    private Question question;
    private Long duration;
    private String content;
    private List<String> commonKeywords;

}
