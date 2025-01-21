package com.aipoweredinterviewmonitoringsystem.user_management_service.service;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;

import java.util.List;

public interface UserService {

    CandidateSaveDTO saveCandidate(CandidateSaveDTO candidateSaveDTO);

    CandidateAndInterviewDTO getCandidateAndInterviewById(Long userId);

    List<AllCandidatesDTO> getAllCandidates();

    String deleteCandidate(Long userId);

    CandidateUpdateDTO updateCandidate(Long userId, CandidateUpdateDTO candidateUpdateDTO);

    String saveComment(long userId, String comment);

    String getName(long userId);



}

