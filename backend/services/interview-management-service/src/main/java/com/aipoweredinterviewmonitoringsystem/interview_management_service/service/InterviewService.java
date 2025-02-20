package com.aipoweredinterviewmonitoringsystem.interview_management_service.service;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated.PaginatedInterviewGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

import java.time.LocalTime;
import java.util.List;

public interface InterviewService {
    InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO);

    List<GetAllInterviewsDTO> getAllInterviews();

    GetInterviewDTO getInterviewById(Long interviewId);

    String deleteInterview(Long interviewId);

    InterviewUpdateDTO updateInterview(Long interviewId, InterviewUpdateDTO interviewUpdateDTO);

    List<InterviewDTO> getAllInterviewsByStatus(Status status);

    Interview getInterviewByCandidateId(Long candidateId);

    PaginatedInterviewGetAllDTO getAllInterviewsPaginated(int page, int size);

    InterviewStatusUpdateDTO updateInterviewStatus(Long interviewId, InterviewStatusUpdateDTO interviewStatusUpdateDTO);


    List<QuestionResponseDTO> getInterviewQuestions(long interviewId);

    double getCompletedInterviewPercentage();

    double calculateSuccessRate();

    double calculateTodayProjection();

    double calculateUnfinishedInterviewsPercentage();

    double getTodayCancelledInterviewsPercentage();

    List<InterviewDTO> getAllInterviewsByResult(Result result);

    Page<GetAllInterviewsDTO> filterInterviews(String positionType, Status status, LocalDate scheduleDate, String scheduleTimeStatus, int page, int size);

    boolean checkInterview(long interviewId);

    LocalTime getInterviewStartTime(long interviewId);
}

