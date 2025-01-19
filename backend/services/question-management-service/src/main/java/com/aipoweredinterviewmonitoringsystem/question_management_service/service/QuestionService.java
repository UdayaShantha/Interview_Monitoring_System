package com.aipoweredinterviewmonitoringsystem.question_management_service.service;


import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated.QuestionPaiginatedDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface QuestionService {
    String deleteQuestion(long questionId);

    GetQuestionDTO getQuestion(long questionId);

    UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId);


    String saveQuestion(SaveQuestionDTO saveQuestionDTO);

    QuestionPaiginatedDTO getQuestionsPaiginated(LocalDateTime date, int page, int size);

}
