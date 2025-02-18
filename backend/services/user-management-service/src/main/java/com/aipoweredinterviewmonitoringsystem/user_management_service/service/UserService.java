package com.aipoweredinterviewmonitoringsystem.user_management_service.service;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated.PaginatedCandidateGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.CandidatePhotoResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;

import java.util.List;

public interface UserService {

    CandidateSaveDTO saveCandidate(CandidateSaveDTO candidateSaveDTO, CandidatePhotoSaveDTO candidatePhotoSaveDTO);

    CandidateAndInterviewDTO getCandidateAndInterviewById(Long userId);

    List<AllCandidatesDTO> getAllCandidates();

    String deleteCandidate(Long userId);

    CandidateUpdateDTO updateCandidate(Long userId, CandidateUpdateDTO candidateUpdateDTO);

    String saveComment(long userId, String comment);

    String getUserName(long userId);

    PositionResponse getCandidatePosition(long userId);

    String saveCandidateFeedback(long userId,int rate, String comment);

    PaginatedCandidateGetAllDTO getAllCandidatesPaginated(int page, int size);

    String getCandidatePositionById(Long userId);

    CandidatePhotoResponse getCandidatePhotosById(long userId);
}