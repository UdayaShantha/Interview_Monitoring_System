package com.aipoweredinterviewmonitoringsystem.question_management_service.service.impl;


import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.*;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
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

    @Override
    public String deleteQuestion(long questionId) {
        if(questionRepository.existsById(questionId)){
                if (commonQuestionRepository.existsById(questionId)) {
                    try{
                        commonQuestionRepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return "Deleted question failed";
                    }
                }
                if (questionDARepository.existsById(questionId)) {
                    try{
                        questionDARepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return "Deleted question failed";
                    }
                }
                if (questionQARepository.existsById(questionId)) {
                    try{
                        questionQARepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return "Deleted question failed";
                    }
                }
                if (questionSERepository.existsById(questionId)) {
                    try{
                        questionSERepository.deleteAllByQuestionId(questionId);
                        return "Deleted question successfully";
                    }
                    catch (Exception e){
                        return "Deleted question failed";
                    }
                }
        }
        return "Not such kind of Question";
    }
}
