package com.aipoweredinterviewmonitoringsystem.interview_management_service.service;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;

import java.util.List;

public interface InterviewService {
    InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO);

    List<InterviewDTO> getAllInterviews();

    InterviewDTO getInterviewById(Long interviewId);

    String deleteInterview(Long interviewId);

    InterviewDTO updateInterview(Long interviewId, InterviewDTO interviewDTO);

    List<InterviewDTO> getAllInterviewsByStatus(String status);
}
