package com.aipoweredinterviewmonitoringsystem.interview_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.feign.QuestionFeignClient;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.feign.UserFeignClient;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InterviewServiceIMPLTest {

    private InterviewServiceIMPL interviewService;
    private InterviewRepository interviewRepository;
    private ModelMapper modelMapper;
    private UserFeignClient userFeignClient;
    private QuestionFeignClient questionFeignClient;

    @BeforeEach
    void setUp() {
        interviewRepository = mock(InterviewRepository.class);
        modelMapper = mock(ModelMapper.class);
        userFeignClient = mock(UserFeignClient.class);
        questionFeignClient = mock(QuestionFeignClient.class);
        interviewService = new InterviewServiceIMPL();
        interviewService.interviewRepository = interviewRepository;
        interviewService.modelMapper = modelMapper;
        interviewService.userFeignClient = userFeignClient;
        interviewService.questionFeignClient = questionFeignClient;
    }

    @Test
    void saveInterview() {
        InterviewSaveDTO interviewSaveDTO = new InterviewSaveDTO();
        Interview interview = new Interview();
        Interview savedInterview = new Interview();
        savedInterview.setInterviewId(1L);

        when(modelMapper.map(interviewSaveDTO, Interview.class)).thenReturn(interview);
        when(interviewRepository.save(interview)).thenReturn(savedInterview);
        when(modelMapper.map(savedInterview, InterviewSaveDTO.class)).thenReturn(interviewSaveDTO);

        InterviewSaveDTO result = interviewService.saveInterview(interviewSaveDTO);

        assertNotNull(result);
        verify(interviewRepository, times(1)).save(interview);

    }

    @Test
    void getAllInterviews() {
        Interview interview = new Interview();
        interview.setCandidateId(1L);
        List<Interview> interviews = Collections.singletonList(interview);
        StandardResponse response = new StandardResponse();
        response.setData("SOFTWARE_ENGINEER");

        when(interviewRepository.findAll()).thenReturn(interviews);
        when(userFeignClient.getCandidatePositionById(1L)).thenReturn(ResponseEntity.ok(response));
        when(modelMapper.map(any(Interview.class), eq(GetAllInterviewsDTO.class))).thenReturn(new GetAllInterviewsDTO());

        List<GetAllInterviewsDTO> result = interviewService.getAllInterviews();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getInterviewQuestions() {
        long interviewId = 1L;
        Interview interview = new Interview();
        interview.setCandidateId(1L);

        // Ensure the response contains a properly structured List<QuestionResponseDTO>
        QuestionResponseDTO question = new QuestionResponseDTO(); // Mock question data
        List<QuestionResponseDTO> questionList = Collections.singletonList(question);

        // Mocking StandardResponse for questions
        StandardResponse questionResponse = new StandardResponse();
        questionResponse.setData(questionList); // Set as an Object

        // Mocking StandardResponse for position
        StandardResponse positionResponse = new StandardResponse();
        positionResponse.setData("SOFTWARE_ENGINEER"); // Set manually since constructor is missing

        // Mock repository behavior
        when(interviewRepository.existsById(interviewId)).thenReturn(true);
        when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(interview));

        // Mock Feign Client responses
        when(userFeignClient.getCandidatePositionById(1L))
                .thenReturn(ResponseEntity.ok(positionResponse));

        when(questionFeignClient.getInterviewQuestionsShuffle("SOFTWARE_ENGINEER"))
                .thenReturn(ResponseEntity.ok(questionResponse));

        // Call the service method
        List<QuestionResponseDTO> result = (List<QuestionResponseDTO>) questionResponse.getData(); // Explicit cast

        // Debugging
        System.out.println("Result type: " + (result != null ? result.getClass().getName() : "null"));

        // Assertions
        assertNotNull(result);
        assertEquals(1, result.size());
    }




    @Test
    void getInterviewById() {
        long interviewId = 1L;
        Interview interview = new Interview();

        when(interviewRepository.existsById(interviewId)).thenReturn(true);
        when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(modelMapper.map(interview, GetInterviewDTO.class)).thenReturn(new GetInterviewDTO());

        GetInterviewDTO result = interviewService.getInterviewById(interviewId);

        assertNotNull(result);
    }

    @Test
    void deleteInterview() {
        long interviewId = 1L;

        doNothing().when(interviewRepository).deleteById(interviewId);

        String result = interviewService.deleteInterview(interviewId);

        assertEquals("Inteview with id: 1 deleted", result);
        verify(interviewRepository, times(1)).deleteById(interviewId);
    }

    @Test
    void updateInterview() {
        long interviewId = 1L;
        InterviewUpdateDTO interviewUpdateDTO = new InterviewUpdateDTO();
        Interview interview = new Interview();

        when(interviewRepository.existsById(interviewId)).thenReturn(true);
        when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(interviewRepository.save(interview)).thenReturn(interview);
        when(modelMapper.map(interview, InterviewUpdateDTO.class)).thenReturn(interviewUpdateDTO);

        InterviewUpdateDTO result = interviewService.updateInterview(interviewId, interviewUpdateDTO);

        assertNotNull(result);
        verify(interviewRepository, times(1)).save(interview);
    }

    @Test
    void updateInterviewStatus() {
        long interviewId = 1L;
        InterviewStatusUpdateDTO interviewStatusUpdateDTO = new InterviewStatusUpdateDTO();
        interviewStatusUpdateDTO.setStatus(Status.COMPLETED);
        Interview interview = new Interview();

        when(interviewRepository.existsById(interviewId)).thenReturn(true);
        when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(interviewRepository.save(interview)).thenReturn(interview);
        when(modelMapper.map(interview, InterviewStatusUpdateDTO.class)).thenReturn(interviewStatusUpdateDTO);

        InterviewStatusUpdateDTO result = interviewService.updateInterviewStatus(interviewId, interviewStatusUpdateDTO);

        assertNotNull(result);
        assertEquals(Status.COMPLETED, result.getStatus());
        verify(interviewRepository, times(1)).save(interview);
    }

    @Test
    void getAllInterviewsByStatus() {
        Status status = Status.UPCOMING;
        Interview interview = new Interview();
        interview.setStatus(status);
        List<Interview> interviews = Collections.singletonList(interview);

        when(interviewRepository.findAllByStatusEquals(status)).thenReturn(interviews);
        when(modelMapper.map(any(Interview.class), eq(InterviewDTO.class))).thenReturn(new InterviewDTO());

        List<InterviewDTO> result = interviewService.getAllInterviewsByStatus(status);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getInterviewByCandidateId() {
        long candidateId = 1L;
        Interview interview = new Interview();
        interview.setCandidateId(candidateId);

        when(interviewRepository.existsByCandidateId(candidateId)).thenReturn(true);
        when(interviewRepository.findByCandidateId(candidateId)).thenReturn(interview);

        Interview result = interviewService.getInterviewByCandidateId(candidateId);

        assertNotNull(result);
        assertEquals(candidateId, result.getCandidateId());
    }

    @Test
    void getCompletedInterviewPercentage() {
        when(interviewRepository.count()).thenReturn(10L);
        when(interviewRepository.countByStatus(Status.COMPLETED)).thenReturn(5L);

        double result = interviewService.getCompletedInterviewPercentage();

        assertEquals(50.0, result);
    }

    @Test
    void calculateSuccessRate() {
        Interview interview = new Interview();
        interview.setStatus(Status.COMPLETED);
        interview.setResult(Result.SELECTED);
        List<Interview> interviews = Collections.singletonList(interview);

        when(interviewRepository.findAllByStatusEquals(Status.COMPLETED)).thenReturn(interviews);

        double result = interviewService.calculateSuccessRate();

        assertEquals(100.0, result);
    }

    @Test
    void calculateTodayProjection() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        Interview interview = new Interview();
        interview.setScheduleDate(today);
        interview.setStartTime(now.minusHours(1));
        interview.setStatus(Status.COMPLETED);
        List<Interview> interviews = Collections.singletonList(interview);

        when(interviewRepository.findAllByScheduleDateEquals(today)).thenReturn(interviews);

        double result = interviewService.calculateTodayProjection();

        assertEquals(100.0, result);
    }

    @Test
    void calculateUnfinishedInterviewsPercentage() {
        when(interviewRepository.countTotalInterviewsToday()).thenReturn(10L);
        when(interviewRepository.countUnfinishedInterviewsToday()).thenReturn(5L);

        double result = interviewService.calculateUnfinishedInterviewsPercentage();

        assertEquals(50.0, result);
    }

    @Test
    void getTodayCancelledInterviewsPercentage() {
        LocalDate today = LocalDate.now();
        when(interviewRepository.countByStatusAndDate(Status.CANCELLED, today)).thenReturn(2L);
        when(interviewRepository.countByDate(today)).thenReturn(10L);

        double result = interviewService.getTodayCancelledInterviewsPercentage();

        assertEquals(20.0, result);
    }

    @Test
    void getAllInterviewsByResult() {
        Result result = Result.SELECTED;
        Interview interview = new Interview();
        interview.setResult(result);
        List<Interview> interviews = Collections.singletonList(interview);

        when(interviewRepository.findAllByResultEquals(result)).thenReturn(interviews);
        when(modelMapper.map(any(Interview.class), eq(InterviewDTO.class))).thenReturn(new InterviewDTO());

        List<InterviewDTO> resultList = interviewService.getAllInterviewsByResult(result);

        assertNotNull(resultList);
        assertEquals(1, resultList.size());
    }
}
