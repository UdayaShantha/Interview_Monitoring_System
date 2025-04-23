package com.aipoweredinterviewmonitoringsystem.interview_management_service.service;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated.PaginatedInterviewGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.GetInterviewDetailsDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import org.springframework.data.domain.Page;

import java.time.Duration;
import java.time.LocalDate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public interface InterviewService {
    InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO);

    List<GetAllInterviewsDTO> getAllInterviews();

    GetInterviewDTO getInterviewById(Long interviewId);

//    String deleteInterview(Long interviewId);

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

    long getCandidateIdByInterviewId(long interviewId);


    GetInterviewDetailsDTO getInterviewDetailsByInterviewId(long interviewId);

    String deleteInterviewByUserId(Long userId);

    GetInterviewDTO getInterviewByUserId(Long userId);

    double calculateSuccessRateByPositionType(String positionType);

    List<InterviewStatusPresentageDTO> getInterviewStatusPercentages();

    InterviewUpdateDTO updateInterviewDuration(long interviewId, int duration);

    Long getInterviewIdByCandidateId(Long candidateId);

    double getInterviewAverageDuration();

    Duration getInterviewRemainingTime(long interviewId);

    List<Integer> getCompletedInterviewCountByEachMonth();

    List<LocalDateTime> getUpcomingInterviewDates();

    List<ResultCountDTO> getResultCountForEachType();
}