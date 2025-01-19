package com.aipoweredinterviewmonitoringsystem.question_management_service.service.impl;


import com.aipoweredinterviewmonitoringsystem.question_management_service.config.ModelMapperConfig;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.QuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated.QuestionPaiginatedDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.*;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;

import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.*;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.LocalDateTime;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionServiceIMPL implements QuestionService {

    @Autowired
    private CommonQuestionRepository commonQuestionRepository;

    @Autowired
    private QuestionDARepository questionDARepository;

    @Autowired
    private QuestionQARepository questionQARepository;

    @Autowired
    private QuestionSERepository questionSERepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ModelMapper modelMapper;

    private long qid;

    @Override
    public String deleteQuestion(long questionId) {
        if(questionRepository.existsById(questionId)){
                if (commonQuestionRepository.existsById(questionId)) {
                    try{
                        commonQuestionRepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return e.getMessage();
                    }
                }
                if (questionDARepository.existsById(questionId)) {
                    try{
                        questionDARepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return e.getMessage();
                    }
                }
                if (questionQARepository.existsById(questionId)) {
                    try{
                        questionQARepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return e.getMessage();
                    }
                }
                if (questionSERepository.existsById(questionId)) {
                    try{
                        questionSERepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return e.getMessage();
                    }
                }
        }
        return "Not such kind of Question";
    }

    @Override
    public GetQuestionDTO getQuestion(long questionId) {
        if(questionRepository.existsById(questionId)){
            this.qid=questionId;
            if (commonQuestionRepository.existsById(questionId)) {
                try{
                    GetQuestionDTO getQuestionDTO =modelMapper.map(commonQuestionRepository.getCommonQuestionByQuestionId(questionId),GetQuestionDTO.class);
                    return getQuestionDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionDARepository.existsById(questionId)) {
                try{
                    GetQuestionDTO getQuestionDTO =modelMapper.map(questionDARepository.getQuestionDAByQuestionId(questionId),GetQuestionDTO.class);
                    return getQuestionDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionQARepository.existsById(questionId)) {
                try{
                    GetQuestionDTO getQuestionDTO =modelMapper.map(questionQARepository.getQuestionQAByQuestionId(questionId),GetQuestionDTO.class);
                    return getQuestionDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionSERepository.existsById(questionId)) {
                try{
                    GetQuestionDTO getQuestionDTO =modelMapper.map(questionSERepository.getQuestionSEByQuestionId(questionId),GetQuestionDTO.class);
                    return getQuestionDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
        }
        return null;
    }

    @Override
    public UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId) {
        if(qid==questionId && getQuestion(questionId).equals(getQuestionDTO)){
            if (commonQuestionRepository.existsById(questionId)) {
                try{
                    CommonQuestion  commonQuestion=modelMapper.map(getQuestionDTO,CommonQuestion.class);
                    UpdateResponseDTO updateResponseDTO =modelMapper.map(commonQuestionRepository.updateCommonQuestion(commonQuestion.getContent(),commonQuestion.getCategory(),commonQuestion.getDuration(),commonQuestion.getKeywords(),questionId),UpdateResponseDTO.class);
                    return updateResponseDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionDARepository.existsById(questionId)) {
                try{
                    QuestionDA questionDA=modelMapper.map(getQuestionDTO,QuestionDA.class);
                    UpdateResponseDTO updateResponseDTO =modelMapper.map(questionDARepository.updateQuestionDA(questionDA.getContent(),questionDA.getCategory(),questionDA.getDuration(),questionDA.getKeywords(),questionId),UpdateResponseDTO.class);
                    return updateResponseDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionQARepository.existsById(questionId)) {
                try{
                    QuestionQA questionQA=modelMapper.map(getQuestionDTO,QuestionQA.class);
                    UpdateResponseDTO updateResponseDTO =modelMapper.map(questionQARepository.updateQuestionQA(questionQA.getContent(),questionQA.getCategory(),questionQA.getDuration(),questionQA.getKeywords(),questionId),UpdateResponseDTO.class);
                    return updateResponseDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
            if (questionSERepository.existsById(questionId)) {
                try{
                    QuestionSE questionSE=modelMapper.map(getQuestionDTO,QuestionSE.class);
                    UpdateResponseDTO updateResponseDTO =modelMapper.map(questionSERepository.updateQuestionSE(questionSE.getContent(),questionSE.getCategory(),questionSE.getDuration(),questionSE.getKeywords(),questionId),UpdateResponseDTO.class);
                    return updateResponseDTO;
                }
                catch (Exception e){
                    return null;
                }
            }
        }
        return null;
    }

    @Override
    public String saveQuestion(SaveQuestionDTO saveQuestionDTO) {

        if (saveQuestionDTO.getCategory() == QuestionType.COMMON) {
            CommonQuestion commonQuestion = new CommonQuestion();
            commonQuestion.setDuration(saveQuestionDTO.getDuration());
            commonQuestion.setContent(saveQuestionDTO.getContent());
            commonQuestion.setKeywords(saveQuestionDTO.getKeywords());
            commonQuestion.setCategory(saveQuestionDTO.getCategory());
            commonQuestion.setCreatedAt(LocalDateTime.now());
            commonQuestionRepository.save(commonQuestion);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.QA) {
            QuestionQA questionQA = new QuestionQA();
            questionQA.setDuration(saveQuestionDTO.getDuration());
            questionQA.setContent(saveQuestionDTO.getContent());
            questionQA.setKeywords(saveQuestionDTO.getKeywords());
            questionQA.setCategory(saveQuestionDTO.getCategory());
            questionQA.setCreatedAt(LocalDateTime.now());
            questionQARepository.save(questionQA);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.DATA_ANALYTICS) {
            QuestionDA questionDA = new QuestionDA();
            questionDA.setDuration(saveQuestionDTO.getDuration());
            questionDA.setContent(saveQuestionDTO.getContent());
            questionDA.setKeywords(saveQuestionDTO.getKeywords());
            questionDA.setCategory(saveQuestionDTO.getCategory());
            questionDA.setCreatedAt(LocalDateTime.now());
            questionDARepository.save(questionDA);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.SOFTWARE_ENGINEERING) {
            QuestionSE questionSE = new QuestionSE();
            questionSE.setDuration(saveQuestionDTO.getDuration());
            questionSE.setContent(saveQuestionDTO.getContent());
            questionSE.setKeywords(saveQuestionDTO.getKeywords());
            questionSE.setCategory(saveQuestionDTO.getCategory());
            questionSE.setCreatedAt(LocalDateTime.now());
            questionSERepository.save(questionSE);
            return "Question saved successfully";
        }
        else {
            return null;
        }
    }
    @Override
    public QuestionPaiginatedDTO getQuestionsPaiginated(LocalDateTime date, int page, int size) {
        try{
            Page<Question> questions=questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page,size, Sort.by("createdAt").descending()));
            if(!questions.isEmpty()) {
                for (Question question : questions) {
                    if(commonQuestionRepository.existsById(question.getQuestionId())) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(commonQuestionRepository.getCommonQuestionsPaiginated(question.getQuestionId()),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if(questionDARepository.existsById(question.getQuestionId())) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionDARepository.getQuestionDASPaiginated(question.getQuestionId()),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if(questionQARepository.existsById(question.getQuestionId())) {
                        QuestionPaiginatedDTO questionPaiginatedDTO= modelMapper.map(questionQARepository.getQuestionQASPaiginated(question.getQuestionId()),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if(questionSERepository.existsById(question.getQuestionId())) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionSERepository.getQuestionSESPaiginated(question.getQuestionId()),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                }
            }
            return null;
        }
        catch (Exception e){
            return null;
        }
    }
}
