package com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated;

import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class QuestionPaiginatedDTO {
    List<UpdateResponseDTO> updateResponseDTOS;
//    private long totalQuestions;
}
