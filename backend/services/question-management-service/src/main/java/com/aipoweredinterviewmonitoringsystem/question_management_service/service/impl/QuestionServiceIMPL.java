package com.aipoweredinterviewmonitoringsystem.question_management_service.service.impl;


import com.aipoweredinterviewmonitoringsystem.question_management_service.config.ModelMapperConfig;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionDA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.*;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
