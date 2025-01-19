package com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response;


import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class SaveQuestionDTO {
    private QuestionType category;
    //private LocalDateTime createdAt;
    //private Question question;
    private Long duration;
    private String content;
    private List<String> keywords;


}
