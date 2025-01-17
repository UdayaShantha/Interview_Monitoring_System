package com.aipoweredinterviewmonitoringsystem.user_management_service.service;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;

import java.util.List;

public interface UserService {


    Candidate saveCandidate(CandidateDTO candidateDTO);

    CandidateDTO getCandidateById(Long userId);

    List<CandidateDTO> getAllCandidates();

    String deleteCandidate(Long userId);

    CandidateDTO updateCandidate(Long userId, CandidateDTO candidateDTO);

    String saveComment(long userId, String comment);

    String getName(long userId);
}

