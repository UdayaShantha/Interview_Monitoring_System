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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



import java.time.LocalDate;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

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
//        if (qid == questionId && getQuestion(questionId).equals(getQuestionDTO)) {
//            if (commonQuestionRepository.existsById(questionId)) {
//                CommonQuestion commonQuestion = modelMapper.map(getQuestionDTO, CommonQuestion.class);
//                UpdateResponseDTO updateResponseDTO = modelMapper.map(commonQuestionRepository.updateCommonQuestion(commonQuestion.getContent(), commonQuestion.getCategory(), commonQuestion.getDuration(), commonQuestion.getKeywords(), questionId), UpdateResponseDTO.class);
//                return updateResponseDTO;
//            }
//            if (questionDARepository.existsById(questionId)) {
//                QuestionDA questionDA = modelMapper.map(getQuestionDTO, QuestionDA.class);
//                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionDARepository.updateQuestionDA(questionDA.getContent(), questionDA.getCategory(), questionDA.getDuration(), questionDA.getKeywords(), questionId), UpdateResponseDTO.class);
//                return updateResponseDTO;
//            }
//            if (questionQARepository.existsById(questionId)) {
//                QuestionQA questionQA = modelMapper.map(getQuestionDTO, QuestionQA.class);
//                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionQARepository.updateQuestionQA(questionQA.getContent(), questionQA.getCategory(), questionQA.getDuration(), questionQA.getKeywords(), questionId), UpdateResponseDTO.class);
//                return updateResponseDTO;
//            }
//            if (questionSERepository.existsById(questionId)) {
//                QuestionSE questionSE = modelMapper.map(getQuestionDTO, QuestionSE.class);
//                UpdateResponseDTO updateResponseDTO = modelMapper.map(questionSERepository.updateQuestionSE(questionSE.getContent(), questionSE.getCategory(), questionSE.getDuration(), questionSE.getKeywords(), questionId), UpdateResponseDTO.class);
//                return updateResponseDTO;
//
//                GetQuestionDTO getQuestionDTO1 = getQuestion(questionId);
//                if (getQuestionDTO1 != null) {
//                    int updatedRows = 0;
//                    if (commonQuestionRepository.existsById(questionId)) {
//                        updatedRows = commonQuestionRepository.updateCommonQuestion(
//                                getQuestionDTO.getContent(),
//                                getQuestionDTO.getCategory(),
//                                getQuestionDTO.getDuration(),
//                                String.join(",", getQuestionDTO.getKeywords()),  // Convert list to string
//                                questionId
//                        );
//                    } else if (questionDARepository.existsById(questionId)) {
//                        updatedRows = questionDARepository.updateQuestionDA(
//                                getQuestionDTO.getContent(),
//                                getQuestionDTO.getCategory(),
//                                getQuestionDTO.getDuration(),
//                                String.join(",", getQuestionDTO.getKeywords()),
//                                questionId
//                        );
//                    } else if (questionQARepository.existsById(questionId)) {
//                        updatedRows = questionQARepository.updateQuestionQA(
//                                getQuestionDTO.getContent(),
//                                getQuestionDTO.getCategory(),
//                                getQuestionDTO.getDuration(),
//                                String.join(",", getQuestionDTO.getKeywords()),
//                                questionId
//                        );
//                    } else if (questionSERepository.existsById(questionId)) {
//                        updatedRows = questionSERepository.updateQuestionSE(
//                                getQuestionDTO.getContent(),
//                                getQuestionDTO.getCategory(),
//                                getQuestionDTO.getDuration(),
//                                String.join(",", getQuestionDTO.getKeywords()),
//                                questionId
//                        );
//                    }
//                    if (updatedRows == 0) {
//                        throw new RuntimeException("Failed to update question with ID: " + questionId);
//
//                    }
//                    return new UpdateResponseDTO(
//                            getQuestionDTO.getContent(),
//                            getQuestionDTO.getCategory(),
//                            getQuestionDTO.getDuration()
//                    );
//                }
//                throw new QuestionNotFoundException("Question Not Found for ID: " + questionId);
//            }
//        }
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
    public QuestionPaiginatedDTO getQuestionsPaiginated(int page, int size) {
        //create the list
        List<UpdateResponseDTO> questionDTOList = new ArrayList<>();

        // Fetch questions based on pagination
        Page<Question> questions = questionRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));

        // Collect all questions
        for (Question question : questions) {
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
        QuestionPaiginatedDTO list = new QuestionPaiginatedDTO();
        list.setUpdateResponseDTOS(questionDTOList);
        return list;
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

//  Question Shuffling algorithm --->
    @Override
    public List<QuestionResponseDTO> getInterviewQuestionsShuffle(String positionType) {
        if (positionType != null) {
            List<QuestionResponseDTO> questionResponseDTOList = new ArrayList<>();
            if (positionType.equalsIgnoreCase("SOFTWARE_ENGINEER")) {
                int count_c = 5;
                int count_se = 8;
                questionResponseDTOList.addAll(
                        commonQuestionRepository.getCommonQuestionByCount(count_c)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
                questionResponseDTOList.addAll(
                        questionSERepository.getQuestionsSEByPoistionAndCount(count_se)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
            }
            if (positionType.equalsIgnoreCase("QA")) {
                int count_c = 5;
                int count_qa = 7;
                questionResponseDTOList.addAll(
                        commonQuestionRepository.getCommonQuestionByCount(count_c)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
                questionResponseDTOList.addAll(
                        questionQARepository.getQuestionsQAByPoistionAndCount(count_qa)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
            }
            if (positionType.equalsIgnoreCase("DATA_ANALYTICS")) {
                int count_c = 5;
                int count_da = 8;
                questionResponseDTOList.addAll(
                        commonQuestionRepository.getCommonQuestionByCount(count_c)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
                questionResponseDTOList.addAll(
                        questionDARepository.getQuestionsDAByPositionAndCount(count_da)
                                .stream()
                                .map(q -> modelMapper.map(q, QuestionResponseDTO.class))
                                .collect(Collectors.toList())
                );
            }
            fisherYatesShuffle(questionResponseDTOList);
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

}
