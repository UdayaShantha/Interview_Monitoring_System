package com.aipoweredinterviewmonitoringsystem.question_management_service.service;


import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated.QuestionPaiginatedDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public interface
QuestionService {
    String deleteQuestion(long questionId);

    GetQuestionDTO getQuestion(long questionId);

    UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId);

    String saveQuestion(SaveQuestionDTO saveQuestionDTO);

    QuestionPaiginatedDTO getQuestionsPaiginated(LocalDate date, int page, int size);

    long getCommonQuestionCount();

    long getQuestionDACount();

    long getQuestionQACount();

    long getQuestionSECount();

    long getAllQuestionCount();

    QuestionPaiginatedDTO getFilteredQuestionsPaiginated(LocalDate date,QuestionType category, long duration, int page, int size);
}