package com.aipoweredinterviewmonitoringsystem.question_management_service.service;


import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;

public interface QuestionService {
    String deleteQuestion(long questionId);

    GetQuestionDTO getQuestion(long questionId);

    UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId);

    String saveQuestion(SaveQuestionDTO saveQuestionDTO);
}
