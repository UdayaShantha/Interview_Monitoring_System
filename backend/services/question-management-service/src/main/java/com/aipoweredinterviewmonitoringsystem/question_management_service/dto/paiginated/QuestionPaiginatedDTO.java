package com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated;

import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class QuestionPaiginatedDTO {
    List<UpdateResponseDTO> updateResponseDTOS;
//    private long totalQuestions;
}
