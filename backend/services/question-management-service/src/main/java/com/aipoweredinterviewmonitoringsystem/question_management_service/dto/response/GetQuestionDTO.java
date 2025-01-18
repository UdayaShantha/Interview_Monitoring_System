package com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GetQuestionDTO {
    private String content;
    private QuestionType category;
    private long duration;
    private List<String> keywords;
}
