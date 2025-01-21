package com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response;


import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class SaveQuestionDTO {
    private String content;
    private QuestionType category;
    private long duration;
    private List<String> keywords;

}
