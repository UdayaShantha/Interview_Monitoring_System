package com.aipoweredinterviewmonitoringsystem.interview_management_service.service;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewUpdateDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;

import java.util.List;

public interface InterviewService {
    InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO);

    List<InterviewDTO> getAllInterviews();

    GetInterviewDTO getInterviewById(Long interviewId);

    String deleteInterview(Long interviewId);

    InterviewUpdateDTO updateInterview(Long interviewId, InterviewUpdateDTO interviewUpdateDTO);

    List<InterviewDTO> getAllInterviewsByStatus(String status);

    Interview getInterviewByCandidateId(Long candidateId);
}
