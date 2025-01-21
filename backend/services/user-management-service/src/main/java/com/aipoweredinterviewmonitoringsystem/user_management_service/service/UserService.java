package com.aipoweredinterviewmonitoringsystem.user_management_service.service;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;

import java.util.List;

public interface UserService {

    CandidateSaveDTO saveCandidate(CandidateSaveDTO candidateSaveDTO);

    CandidateAndInterviewDTO getCandidateAndInterviewById(Long userId);

    List<AllCandidatesDTO> getAllCandidates();

    String deleteCandidate(Long userId);

    CandidateDTO updateCandidate(Long userId, CandidateDTO candidateDTO);

    String saveComment(long userId, String comment);

    String getUserName(long userId);


    PositionResponse getCandidatePosition(long userId);
}

