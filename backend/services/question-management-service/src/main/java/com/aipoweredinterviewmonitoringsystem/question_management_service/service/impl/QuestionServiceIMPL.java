package com.aipoweredinterviewmonitoringsystem.question_management_service.service.impl;



import com.aipoweredinterviewmonitoringsystem.question_management_service.advisor.QuestionNotFoundException;
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


import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


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

    private long qid;

    @Override
    public String deleteQuestion(long questionId) {
        if (questionRepository.existsById(questionId)) {
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
            this.qid = questionId;
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

    @Override
    public UpdateResponseDTO updateQuestion(GetQuestionDTO getQuestionDTO, long questionId) {
        if (qid == questionId && getQuestion(questionId).equals(getQuestionDTO)) {
            if (commonQuestionRepository.existsById(questionId)) {
                CommonQuestion commonQuestion = modelMapper.map(getQuestionDTO, CommonQuestion.class);
                UpdateResponseDTO updateResponseDTO = modelMapper.map(commonQuestionRepository.updateCommonQuestion(commonQuestion.getContent(), commonQuestion.getCategory(), commonQuestion.getDuration(), commonQuestion.getKeywords(), questionId), UpdateResponseDTO.class);
                return updateResponseDTO;
            }
            if (questionDARepository.existsById(questionId)) {
                QuestionDA questionDA = modelMapper.map(getQuestionDTO, QuestionDA.class);
                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionDARepository.updateQuestionDA(questionDA.getContent(), questionDA.getCategory(), questionDA.getDuration(), questionDA.getKeywords(), questionId), UpdateResponseDTO.class);
                return updateResponseDTO;
            }
            if (questionQARepository.existsById(questionId)) {
                QuestionQA questionQA = modelMapper.map(getQuestionDTO, QuestionQA.class);
                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionQARepository.updateQuestionQA(questionQA.getContent(), questionQA.getCategory(), questionQA.getDuration(), questionQA.getKeywords(), questionId), UpdateResponseDTO.class);
                return updateResponseDTO;
            }
            if (questionSERepository.existsById(questionId)) {
                QuestionSE questionSE = modelMapper.map(getQuestionDTO, QuestionSE.class);
                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionSERepository.updateQuestionSE(questionSE.getContent(), questionSE.getCategory(), questionSE.getDuration(), questionSE.getKeywords(), questionId), UpdateResponseDTO.class);
                return updateResponseDTO;
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
            commonQuestion.setCreatedAt(LocalDate.now());
            commonQuestionRepository.save(commonQuestion);
            return "Question saved successfully";
        } else if (saveQuestionDTO.getCategory() == QuestionType.QA) {
            QuestionQA questionQA = new QuestionQA();
            questionQA.setDuration(saveQuestionDTO.getDuration());
            questionQA.setContent(saveQuestionDTO.getContent());
            questionQA.setKeywords(saveQuestionDTO.getKeywords());
            questionQA.setCategory(saveQuestionDTO.getCategory());
            questionQA.setCreatedAt(LocalDate.now());
            questionQARepository.save(questionQA);
            return "Question saved successfully";
        } else if (saveQuestionDTO.getCategory() == QuestionType.DATA_ANALYTICS) {
            QuestionDA questionDA = new QuestionDA();
            questionDA.setDuration(saveQuestionDTO.getDuration());
            questionDA.setContent(saveQuestionDTO.getContent());
            questionDA.setKeywords(saveQuestionDTO.getKeywords());
            questionDA.setCategory(saveQuestionDTO.getCategory());
            questionDA.setCreatedAt(LocalDate.now());
            questionDARepository.save(questionDA);
            return "Question saved successfully";
        } else if (saveQuestionDTO.getCategory() == QuestionType.SOFTWARE_ENGINEERING) {
            QuestionSE questionSE = new QuestionSE();
            questionSE.setDuration(saveQuestionDTO.getDuration());
            questionSE.setContent(saveQuestionDTO.getContent());
            questionSE.setKeywords(saveQuestionDTO.getKeywords());
            questionSE.setCategory(saveQuestionDTO.getCategory());
            questionSE.setCreatedAt(LocalDate.now());
            questionSERepository.save(questionSE);
            return "Question saved successfully";
        } else {
            return null;
        }
    }


    @Override
    public QuestionPaiginatedDTO getQuestionsPaiginated(LocalDate date, int page, int size) {
        Page<Question> questions = questionRepository.findQuestionsByCreatedAtBefore(date, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        if (!questions.isEmpty()) {
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
    public QuestionPaiginatedDTO getFilteredQuestionsPaiginated(LocalDate date, QuestionType category, long duration, int page, int size) {
        //create the list
        List<UpdateResponseDTO> questionDTOList = new ArrayList<>();

        // Fetch questions based on creation date and pagination
        Page<Question> questions = null  ;
        if(date == null){
            questions = questionRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        }else {
            questions = questionRepository.findQuestionsByCreatedAt(
                    date, PageRequest.of(page, size, Sort.by("createdAt").descending())
            );
        }

        // Collect all matching questions
        for (Question question : questions) {
            System.out.println("questions" + question);
//            System.out.println(duration);
            if (category != null && duration == 0) {
                if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    commonQuestionRepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionDARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByCategory(category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionQARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionSERepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
            }

            if (category == null && duration != 0) {
                if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration)) {
                    questionDTOList.add(modelMapper.map(
                                    commonQuestionRepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration)) {
                    questionDTOList.add(modelMapper.map(
                                    questionDARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration)) {
                    questionDTOList.add(modelMapper.map(
                                    questionQARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration)) {
                    questionDTOList.add(modelMapper.map(
                                    questionSERepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
            }

            if (category != null && duration != 0) {
                if (commonQuestionRepository.existsById(question.getQuestionId()) && commonQuestionRepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration) && commonQuestionRepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    commonQuestionRepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionDARepository.existsById(question.getQuestionId()) && questionDARepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration) && questionDARepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionDARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionQARepository.existsById(question.getQuestionId()) && questionQARepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration) && questionQARepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionQARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionSERepository.existsById(question.getQuestionId()) && questionSERepository.existsByQuestionIdAndDuration(question.getQuestionId(), duration) && questionSERepository.existsByQuestionIdAndCategory(question.getQuestionId(), category)) {
                    questionDTOList.add(modelMapper.map(
                                    questionSERepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
            }

            if (category == null && duration == 0) {
                if (commonQuestionRepository.existsById(question.getQuestionId())) {
                    questionDTOList.add(modelMapper.map(
                                    commonQuestionRepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionDARepository.existsById(question.getQuestionId())) {
                    questionDTOList.add(modelMapper.map(
                                    questionDARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionQARepository.existsById(question.getQuestionId())) {
                    questionDTOList.add(modelMapper.map(
                                    questionQARepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
                if (questionSERepository.existsById(question.getQuestionId())) {
                    questionDTOList.add(modelMapper.map(
                                    questionSERepository.findById(question.getQuestionId()), UpdateResponseDTO.class
                            )
                    );
                }
            }
        }
        QuestionPaiginatedDTO list = new QuestionPaiginatedDTO();
        list.setUpdateResponseDTOS(questionDTOList);
        return list;
    }
}
