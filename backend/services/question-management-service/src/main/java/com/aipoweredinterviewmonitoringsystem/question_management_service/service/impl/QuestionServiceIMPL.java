package com.aipoweredinterviewmonitoringsystem.question_management_service.service.impl;



import com.aipoweredinterviewmonitoringsystem.question_management_service.advisor.QuestionNotFoundException;
import com.aipoweredinterviewmonitoringsystem.question_management_service.config.ModelMapperConfig;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.QuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated.QuestionPaiginatedDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.*;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;

import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.*;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import java.util.*;


import java.time.LocalDate;

import java.time.LocalDateTime;

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

//    private static final int MAX_DURATION = 45 * 60;

    @Override
    public String deleteQuestion(long questionId) {
        if(questionRepository.existsById(questionId)){
            if (commonQuestionRepository.existsById(questionId)) {
                commonQuestionRepository.deleteAllByQuestionId(questionId);
                return "Deleted question successfully";
            }
            if (questionDARepository.existsById(questionId)) {
                questionDARepository.deleteAllByQuestionId(questionId);
                return "Deleted question successfully";
            }
            if (questionQARepository.existsById(questionId)) {
                questionQARepository.deleteAllByQuestionId(questionId);
                return "Deleted question successfully";
            }
            if (questionSERepository.existsById(questionId)) {
                questionSERepository.deleteAllByQuestionId(questionId);
                return "Deleted question successfully";
            }
        }
        throw new QuestionNotFoundException("Not such kind of Question");
    }

    @Override
    public GetQuestionDTO getQuestion(long questionId) {
        if (questionRepository.existsById(questionId)) {
            if (commonQuestionRepository.existsById(questionId)) {
                Object result = commonQuestionRepository.getCommonQuestionByQuestionId(questionId);
                if (result == null) {
                    throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
                }
                Object[] data = (Object[]) result;
                String content = (String) data[0];
                QuestionType category = (QuestionType) data[1];
                long duration = (long) data[2];
                String keywordsString = (String) data[3];
                List<String> keywords = Arrays.asList(keywordsString.split(","));
                return new GetQuestionDTO(content, category, duration, keywords);
            }
            if (questionDARepository.existsById(questionId)) {
                Object result = questionDARepository.getQuestionDAByQuestionId(questionId);
                if (result == null) {
                    throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
                }
                Object[] data = (Object[]) result;
                String content = (String) data[0];
                QuestionType category = (QuestionType) data[1];
                long duration = (long) data[2];
                String keywordsString = (String) data[3];
                List<String> keywords = Arrays.asList(keywordsString.split(","));
                return new GetQuestionDTO(content, category, duration, keywords);
            }
            if (questionQARepository.existsById(questionId)) {
                Object result = questionQARepository.getQuestionQAByQuestionId(questionId);
                if (result == null) {
                    throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
                }
                Object[] data = (Object[]) result;
                String content = (String) data[0];
                QuestionType category = (QuestionType) data[1];
                long duration = (long) data[2];
                String keywordsString = (String) data[3];
                List<String> keywords = Arrays.asList(keywordsString.split(","));
                return new GetQuestionDTO(content, category, duration, keywords);
            }
            if (questionSERepository.existsById(questionId)) {
                Object result = questionSERepository.getQuestionSEByQuestionId(questionId);
                if (result == null) {
                    throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
                }
                Object[] data = (Object[]) result;
                String content = (String) data[0];
                QuestionType category = (QuestionType) data[1];
                long duration = (long) data[2];
                String keywordsString = (String) data[3];
                List<String> keywords = Arrays.asList(keywordsString.split(","));
                return new GetQuestionDTO(content, category, duration, keywords);
            }
        }
        return null;
    }

    @Transactional
    @Override
    public UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId) {
        GetQuestionDTO getQuestionDTO1=getQuestion(questionId);
        if(getQuestionDTO1 != null) {
            int updatedRows = 0;
            if (commonQuestionRepository.existsById(questionId)) {
                updatedRows = commonQuestionRepository.updateCommonQuestion(
                        getQuestionDTO.getContent(),
                        getQuestionDTO.getCategory(),
                        getQuestionDTO.getDuration(),
                        String.join(",", getQuestionDTO.getKeywords()),
                        questionId
                );
            } else if (questionDARepository.existsById(questionId)) {
                updatedRows = questionDARepository.updateQuestionDA(
                        getQuestionDTO.getContent(),
                        getQuestionDTO.getCategory(),
                        getQuestionDTO.getDuration(),
                        String.join(",", getQuestionDTO.getKeywords()),
                        questionId
                );
            } else if (questionQARepository.existsById(questionId)) {
                updatedRows = questionQARepository.updateQuestionQA(
                        getQuestionDTO.getContent(),
                        getQuestionDTO.getCategory(),
                        getQuestionDTO.getDuration(),
                        String.join(",", getQuestionDTO.getKeywords()),
                        questionId
                );
            } else if (questionSERepository.existsById(questionId)) {
                updatedRows = questionSERepository.updateQuestionSE(
                        getQuestionDTO.getContent(),
                        getQuestionDTO.getCategory(),
                        getQuestionDTO.getDuration(),
                        String.join(",", getQuestionDTO.getKeywords()),
                        questionId
                );
            }
            if (updatedRows == 0) {
                throw new RuntimeException("Failed to update question with ID: " + questionId);
            }
            return new UpdateResponseDTO(
                    getQuestionDTO.getContent(),
                    getQuestionDTO.getCategory(),
                    getQuestionDTO.getDuration()
            );
        }
        throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
    }

    @Override
    public String saveQuestion(SaveQuestionDTO saveQuestionDTO) {

        if (saveQuestionDTO.getCategory() == QuestionType.COMMON) {
            CommonQuestion commonQuestion = new CommonQuestion();
            commonQuestion.setDuration(saveQuestionDTO.getDuration());
            commonQuestion.setContent(saveQuestionDTO.getContent());
            commonQuestion.setKeywords(saveQuestionDTO.getKeywords());
            commonQuestion.setCategory(saveQuestionDTO.getCategory());
            commonQuestion.setCreatedAt(LocalDate.now());
            commonQuestionRepository.save(commonQuestion);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.QA) {
            QuestionQA questionQA = new QuestionQA();
            questionQA.setDuration(saveQuestionDTO.getDuration());
            questionQA.setContent(saveQuestionDTO.getContent());
            questionQA.setKeywords(saveQuestionDTO.getKeywords());
            questionQA.setCategory(saveQuestionDTO.getCategory());
            questionQA.setCreatedAt(LocalDate.now());
            questionQARepository.save(questionQA);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.DATA_ANALYTICS) {
            QuestionDA questionDA = new QuestionDA();
            questionDA.setDuration(saveQuestionDTO.getDuration());
            questionDA.setContent(saveQuestionDTO.getContent());
            questionDA.setKeywords(saveQuestionDTO.getKeywords());
            questionDA.setCategory(saveQuestionDTO.getCategory());
            questionDA.setCreatedAt(LocalDate.now());
            questionDARepository.save(questionDA);
            return "Question saved successfully";
        }
        else if (saveQuestionDTO.getCategory() == QuestionType.SOFTWARE_ENGINEERING) {
            QuestionSE questionSE = new QuestionSE();
            questionSE.setDuration(saveQuestionDTO.getDuration());
            questionSE.setContent(saveQuestionDTO.getContent());
            questionSE.setKeywords(saveQuestionDTO.getKeywords());
            questionSE.setCategory(saveQuestionDTO.getCategory());
            questionSE.setCreatedAt(LocalDate.now());
            questionSERepository.save(questionSE);
            return "Question saved successfully";
        }
        else {
            return null;
        }
    }


    @Override
    public QuestionPaiginatedDTO getQuestionsPaiginated(LocalDate date, int page, int size) {
        Page<Question> questions=questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page,size, Sort.by("createdAt").descending()));
        if(!questions.isEmpty()) {
            for (Question question : questions) {
                if (commonQuestionRepository.existsById(question.getQuestionId())) {
                    QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(commonQuestionRepository.getCommonQuestionsPaiginated(question.getQuestionId()), QuestionPaiginatedDTO.class);
                    return questionPaiginatedDTO;
                }
                if (questionDARepository.existsById(question.getQuestionId())) {
                    QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionDARepository.getQuestionDASPaiginated(question.getQuestionId()), QuestionPaiginatedDTO.class);
                    return questionPaiginatedDTO;
                }
                if (questionQARepository.existsById(question.getQuestionId())) {
                    QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionQARepository.getQuestionQASPaiginated(question.getQuestionId()), QuestionPaiginatedDTO.class);
                    return questionPaiginatedDTO;
                }
                if (questionSERepository.existsById(question.getQuestionId())) {
                    QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionSERepository.getQuestionSESPaiginated(question.getQuestionId()), QuestionPaiginatedDTO.class);
                    return questionPaiginatedDTO;
                }
            }
        }
        return null;
    }

    @Override
    public long getCommonQuestionCount() {

        return commonQuestionRepository.count();
    }

    @Override
    public long getQuestionDACount() {

        return questionDARepository.count();
    }

    @Override
    public long getQuestionQACount() {

        return questionQARepository.count();
    }

    @Override
    public long getQuestionSECount() {

        return questionSERepository.count();
    }

    @Override
    public long getAllQuestionCount() {

        return questionRepository.count();
    }



    @Override
    public QuestionPaiginatedDTO getFilteredQuestionsPaiginated(LocalDate date,QuestionType category, long duration, int page, int size) {
        if(category != null && duration == 0) {
            Page<Question> questions = questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page, size, Sort.by("createdAt").descending()));
            if (!questions.isEmpty()) {
                for (Question question : questions) {
                    if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(commonQuestionRepository.getCommonQuestionsPaiginatedByCategory(question.getQuestionId(),category),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionDARepository.getCommonQuestionsPaiginatedByCategory(question.getQuestionId(),category),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionQARepository.getCommonQuestionsPaiginatedByCategory(question.getQuestionId(),category),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionSERepository.getCommonQuestionsPaiginatedByCategory(question.getQuestionId(),category),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                }
            }
        }
        if(category == null && duration != 0){
            Page<Question> questions = questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page, size, Sort.by("createdAt").descending()));
            if (!questions.isEmpty()) {
                for (Question question : questions) {
                    if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByDuration(duration)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(commonQuestionRepository.getCommonQuestionsPaiginatedByDuration(question.getQuestionId(),duration),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByDuration(duration)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionDARepository.getCommonQuestionsPaiginatedByDuration(question.getQuestionId(),duration),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByDuration(duration)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionQARepository.getCommonQuestionsPaiginatedByDuration(question.getQuestionId(),duration),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByDuration(duration)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO=modelMapper.map(questionSERepository.getCommonQuestionsPaiginatedByDuration(question.getQuestionId(),duration),QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                }
            }
        }
        if (category != null && duration != 0) {
            Page<Question> questions = questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page, size, Sort.by("createdAt").descending()));
            if (!questions.isEmpty()) {
                for (Question question : questions) {
                    if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByDuration(duration) && commonQuestionRepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(commonQuestionRepository.getCommonQuestionsPaiginatedByDurationAndCategory(question.getQuestionId(), duration, category), QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByDuration(duration) && questionDARepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionDARepository.getCommonQuestionsPaiginatedByDurationAndCategory(question.getQuestionId(), duration, category), QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByDuration(duration) && questionQARepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionQARepository.getCommonQuestionsPaiginatedByDurationAndCategory(question.getQuestionId(), duration, category), QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                    if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByDuration(duration) && questionSERepository.existsByCategory(category)) {
                        QuestionPaiginatedDTO questionPaiginatedDTO = modelMapper.map(questionSERepository.getCommonQuestionsPaiginatedByDurationAndCategory(question.getQuestionId(), duration, category), QuestionPaiginatedDTO.class);
                        return questionPaiginatedDTO;
                    }
                }
            }
        }
        if(category == null && duration == 0){
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
        }
        return null;
    }

//  Question Shuffling algorithm --->
    @Override
    public List<QuestionResponseDTO> getInterviewQuestionsShuffle(String positionType) {
        if(positionType != null){
            List<QuestionResponseDTO> questionResponseDTOList=new ArrayList<>();
            if(positionType.equalsIgnoreCase("SOFTWARE_ENGINEER")){
                int count_c=5;
                int count_se=8;
                questionResponseDTOList.add(
                        modelMapper.map(commonQuestionRepository.getCommonQuestionByCount(count_c),QuestionResponseDTO.class)
                );
                questionResponseDTOList.add(
                        modelMapper.map(questionSERepository.getQuestionsSEByPoistionAndCount(count_se),QuestionResponseDTO.class)
                );
            }
            if(positionType.equalsIgnoreCase("QA")){
                int count_c=5;
                int count_qa=7;
                questionResponseDTOList.add(
                        modelMapper.map(commonQuestionRepository.getCommonQuestionByCount(count_c),QuestionResponseDTO.class)
                );
                questionResponseDTOList.add(
                        modelMapper.map(questionQARepository.getQuestionsQAByPoistionAndCount(count_qa),QuestionResponseDTO.class)
                );
            }
            if(positionType.equalsIgnoreCase("DATA_ANALYTICS")){
                int count_c=5;
                int count_da=8;
                questionResponseDTOList.add(
                        modelMapper.map(commonQuestionRepository.getCommonQuestionByCount(count_c),QuestionResponseDTO.class)
                );
                questionResponseDTOList.add(
                        modelMapper.map(questionDARepository.getQuestionsDAByPositionAndCount(count_da),QuestionResponseDTO.class)
                );
            }
            fisherYatesShuffle(questionResponseDTOList);
//          return adjustDuration(questionResponseDTOList, MAX_DURATION);
            return questionResponseDTOList;
        }
        throw new QuestionNotFoundException("Questions not found");
    }

    private void fisherYatesShuffle(List<QuestionResponseDTO> questionResponseDTOList) {
        Random random = new Random();
        for (int i = questionResponseDTOList.size() - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            Collections.swap(questionResponseDTOList, i, j);
        }
    }

//    private List<QuestionResponseDTO> adjustDuration(List<QuestionResponseDTO> questionResponseDTOList, int maxDuration) {
//        int totalDuration = 0;
//        for(QuestionResponseDTO questionResponseDTO : questionResponseDTOList) {
//            if(commonQuestionRepository.getCommonQuestionByContentEquals(questionResponseDTO.getContent())){
//                totalDuration += commonQuestionRepository.getCommonQuestionDurationByContentEquals(questionResponseDTO.getContent());
//            }
//            if(questionDARepository.getQuestionDAByContentEquals(questionResponseDTO.getContent())){
//                totalDuration += questionDARepository.getQuestionDADurationByContentEquals(questionResponseDTO.getContent());
//            }
//            if(questionSERepository.getQuestionSEByContentEquals(questionResponseDTO.getContent())){
//                totalDuration += questionSERepository.getQuestionSEDurationByContentEquals(questionResponseDTO.getContent());
//            }
//            if(questionQARepository.getQuestionQAByContentEquals(questionResponseDTO.getContent())){
//                totalDuration += questionQARepository.getQuestionQADurationByContentEquals(questionResponseDTO.getContent());
//            }
//        }
//        if (totalDuration <= maxDuration){
//            return questionResponseDTOList;
//        }
//
//        // Sort by duration (longest first)
//
//    }
}
