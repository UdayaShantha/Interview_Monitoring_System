package com.aipoweredinterviewmonitoringsystem.question_management_service.service;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.*;
import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class QuestionService {

    @Autowired private CommonQuestionRepository commonQuestionRepository;
    @Autowired private QuestionDSRepository questionDSRepository;
    @Autowired private QuestionQARepository questionQARepository;
    @Autowired private QuestionSERepository questionSERepository;


    public <T> T saveQuestion(T questionEntity) {
        if (questionEntity instanceof CommonQuestion)
            return (T) commonQuestionRepository.save((CommonQuestion) questionEntity);
        else if (questionEntity instanceof QuestionDS)
            return (T) questionDSRepository.save((QuestionDS) questionEntity);
        else if (questionEntity instanceof QuestionQA)
            return (T) questionQARepository.save((QuestionQA) questionEntity);
        else if (questionEntity instanceof QuestionSE)
            return (T) questionSERepository.save((QuestionSE) questionEntity);
        throw new IllegalArgumentException("Unknown question entity");
    }

    public <T> Optional<T> findQuestionById(Long id, Class<T> questionClass) {
        if (questionClass == CommonQuestion.class)
            return (Optional<T>) commonQuestionRepository.findById(id);
        else if (questionClass == QuestionDS.class)
            return (Optional<T>) questionDSRepository.findById(id);
        else if (questionClass == QuestionQA.class)
            return (Optional<T>) questionQARepository.findById(id);
        else if (questionClass == QuestionSE.class)
            return (Optional<T>) questionSERepository.findById(id);
        return Optional.empty();
    }

    public void deleteQuestionById(Long id, Class<?> questionClass) {
        if (questionClass == CommonQuestion.class)
            commonQuestionRepository.deleteById(id);
        else if (questionClass == QuestionDS.class)
            questionDSRepository.deleteById(id);
        else if (questionClass == QuestionQA.class)
            questionQARepository.deleteById(id);
        else if (questionClass == QuestionSE.class)
            questionSERepository.deleteById(id);
    }

    public <T> T updateQuestionById(Long id, T updatedQuestion) {
        if (updatedQuestion instanceof CommonQuestion) {
            Optional<CommonQuestion> existing = commonQuestionRepository.findById(id);
            if (existing.isPresent()) {
                CommonQuestion question = (CommonQuestion) updatedQuestion;
                question.setCommonQuestionId(id);
                return (T) commonQuestionRepository.save(question);
            }
        } else if (updatedQuestion instanceof QuestionDS) {
            Optional<QuestionDS> existing = questionDSRepository.findById(id);
            if (existing.isPresent()) {
                QuestionDS question = (QuestionDS) updatedQuestion;
                question.setQuestionDSId(id);
                return (T) questionDSRepository.save(question);
            }
        } else if (updatedQuestion instanceof QuestionQA) {
            Optional<QuestionQA> existing = questionQARepository.findById(id);
            if (existing.isPresent()) {
                QuestionQA question = (QuestionQA) updatedQuestion;
                question.setQuestionQAId(id);
                return (T) questionQARepository.save(question);
            }
        } else if (updatedQuestion instanceof QuestionSE) {
            Optional<QuestionSE> existing = questionSERepository.findById(id);
            if (existing.isPresent()) {
                QuestionSE question = (QuestionSE) updatedQuestion;
                question.setQuestionSEId(id);
                return (T) questionSERepository.save(question);
            }
        }

        throw new IllegalArgumentException("Unknown question entity or entity not found");
    }

}
