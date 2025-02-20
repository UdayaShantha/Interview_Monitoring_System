package com.aipoweredinterviewmonitoringsystem.user_management_service.service.impl;


import com.aipoweredinterviewmonitoringsystem.user_management_service.advisor.CandidateNotFoundException;
import com.aipoweredinterviewmonitoringsystem.user_management_service.advisor.UserNotFoundException;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated.PaginatedCandidateGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.CandidatePhotoResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;
import com.aipoweredinterviewmonitoringsystem.user_management_service.feign.InterviewFeignClient;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserServiceIMPL implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private HrTeamRepository hrTeamRepository;

    @Autowired
    private TechnicalTeamRepository technicalTeamRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private InterviewFeignClient interviewFeignClient;

    @Override
    @Transactional
    public CandidateSaveDTO saveCandidate(CandidateSaveDTO candidateSaveDTO, CandidatePhotoSaveDTO candidatePhotoSaveDTO) {
        Candidate candidate = modelMapper.map(candidateSaveDTO, Candidate.class);
        candidate.setUserType(UserType.CANDIDATE);
        candidate.setCreatedAt(LocalDateTime.now());

        if (candidatePhotoSaveDTO.getPhotos() != null && !candidatePhotoSaveDTO.getPhotos().isEmpty()) {
            try {
                List<byte[]> photoBytes = candidatePhotoSaveDTO.getPhotos().stream()
                        .map(photo -> {
                            try {
                                return photo.getBytes();
                            } catch (IOException e) {
                                throw new RuntimeException("Failed to store image", e);
                            }
                        })
                        .collect(Collectors.toList());
                candidate.setPhotos(photoBytes);
            } catch (Exception e) {
                throw new RuntimeException("Error processing candidate photos", e);
            }
        }

        Candidate savedCandidate = candidateRepository.save(candidate);

        // Save interview details via Feign Client
        InterviewSaveDTO interviewSaveDTO = new InterviewSaveDTO();
        interviewSaveDTO.setCandidateId(savedCandidate.getUserId());
        interviewSaveDTO.setScheduleDate(candidateSaveDTO.getScheduleDate());
        interviewSaveDTO.setStartTime(candidateSaveDTO.getStartTime());

        ResponseEntity<StandardResponse> response = interviewFeignClient.saveInterview(interviewSaveDTO);

        return candidateSaveDTO;
    }


    @Override
    public CandidateAndInterviewDTO getCandidateAndInterviewById(Long userId) {
        if (candidateRepository.existsById(userId)) {
            Candidate candidate = candidateRepository.findById(userId).get();
            CandidateAndInterviewDTO candidateAndInterviewDTO = modelMapper.map(candidate, CandidateAndInterviewDTO.class);

            ResponseEntity<StandardResponse> response = interviewFeignClient.getInterviewById(candidate.getUserId());
            if (response.getBody() != null && response.getBody().getData() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
                if (data.containsKey("duration") && data.containsKey("scheduleDate") && data.containsKey("startTime")) {
                    candidateAndInterviewDTO.setDuration(Double.parseDouble(data.get("duration").toString()));
                    candidateAndInterviewDTO.setScheduleDate(LocalDate.parse(data.get("scheduleDate").toString()));
                    candidateAndInterviewDTO.setStartTime(LocalTime.parse(data.get("startTime").toString()));
                }
            }
            return candidateAndInterviewDTO;
        } else {
            throw new CandidateNotFoundException("No candidate found with id " + userId);
        }

    }

    @Override
    public List<AllCandidatesDTO> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<AllCandidatesDTO> allCandidatesDTOS = new ArrayList<>();
        for (Candidate candidate : candidates) {
            allCandidatesDTOS.add(modelMapper.map(candidate, AllCandidatesDTO.class));
        }

        return allCandidatesDTOS;
    }
    @Override
    public PaginatedCandidateGetAllDTO getAllCandidatesPaginated(int page, int size) {
        Page<Candidate> candidates = candidateRepository.findAll(PageRequest.of(page, size));
        if (!candidates.hasContent()) {
            throw new EntityNotFoundException("No candidates found");
        }

        List<AllCandidatesDTO> allCandidatesDTOs = new ArrayList<>();
        for (Candidate candidate : candidates.getContent()) {
            allCandidatesDTOs.add(modelMapper.map(candidate, AllCandidatesDTO.class));
        }

        PaginatedCandidateGetAllDTO paginatedCandidateGetAllDTO = new PaginatedCandidateGetAllDTO(
                allCandidatesDTOs,
                candidates.getTotalElements()
        );

        return paginatedCandidateGetAllDTO;
    }

    @Override
    public String getCandidatePositionById(Long userId) {
        Candidate candidate = candidateRepository.findById(userId).get();
        return candidate.getPositionType().name();
    }

    @Override
    public CandidatePhotoResponse getCandidatePhotosById(long userId) {
        if (!candidateRepository.existsById(userId)) {
            throw new UserNotFoundException("No such kind of candidate found");
        }
        Candidate candidate = candidateRepository.findCandidateByUserId(userId);
        CandidatePhotoResponse photoDTO = new CandidatePhotoResponse();
        if (candidate.getPhotos() != null && !candidate.getPhotos().isEmpty()) {
            List<byte[]> photosCopy = candidate.getPhotos().stream()
                    .map(bytes -> bytes.clone())
                    .collect(Collectors.toList());
            photoDTO.setPhotos(photosCopy);
            return photoDTO;
        }
        photoDTO.setPhotos(new ArrayList<>());
        return photoDTO;
    }

    @Override
    public String deleteCandidate(Long userId) {
        if(!candidateRepository.existsById(userId)){
            throw new CandidateNotFoundException("No such kind of candidate found");
        }
        candidateRepository.deleteById(userId);

        ResponseEntity<StandardResponse> response = interviewFeignClient.getInterviewById(userId);

        if (response.getBody() != null && response.getBody().getData() != null) {
            Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
            Long interviewId = (Long)data.get("id");
            interviewFeignClient.deleteInterview(interviewId);
        }

        return "Candidate with id: " + userId + " deleted";
    }

    @Override
    @Transactional
    public CandidateUpdateDTO updateCandidate(Long userId, CandidateUpdateDTO candidateUpdateDTO) {
        try {
            Candidate candidate = candidateRepository.findById(userId).get();
            candidate.setUsername(candidateUpdateDTO.getUsername());
            candidate.setPassword(candidateUpdateDTO.getPassword());
            candidate.setName(candidateUpdateDTO.getName());
            candidate.setNic(candidateUpdateDTO.getNic());
            candidate.setEmail(candidateUpdateDTO.getEmail());
            candidate.setAddress(candidateUpdateDTO.getAddress());
            candidate.setPhone(candidateUpdateDTO.getPhone());
            candidate.setBirthday(candidateUpdateDTO.getBirthday());
            candidate.setPositionType(candidateUpdateDTO.getPositionType());
            candidateRepository.save(candidate);
            return modelMapper.map(candidate, CandidateUpdateDTO.class);
        }
        catch (Exception e) {
            throw new RuntimeException("Error processing update", e);
        }
    }

    @Override
    public String saveComment(long userId,String comment) {
        if(userRepository.existsById(userId)){
            try {
                if (hrTeamRepository.existsById(userId)) {
                    hrTeamRepository.saveComment(userId,comment);
                    return "Comment saved";
                }
                if (technicalTeamRepository.existsById(userId)) {
                    technicalTeamRepository.saveComment(userId,comment);
                    return "Comment saved";
                }
            } catch (RuntimeException e) {
                throw new RuntimeException("Comment not saved", e);
            }
        }
        throw new UserNotFoundException("No such kind of User");
    }

    @Override
    public String getUserName(long userId) {
        if(userRepository.existsById(userId)){
            try {
                if (hrTeamRepository.existsById(userId)) {
                    return hrTeamRepository.findNameByUserId(userId);
                }
                if (technicalTeamRepository.existsById(userId)) {
                    return technicalTeamRepository.findNameByUserId(userId);
                }
            } catch (RuntimeException e) {
                throw new RuntimeException("Can't get the logged user's name", e);
            }
        }
        throw new UserNotFoundException("No such kind of User");
    }

    @Override
    public PositionResponse getCandidatePosition(long userId) {
        if(candidateRepository.existsById(userId)) {
            Candidate candidate=candidateRepository.findPositionByuserId(userId);
            PositionResponse positionResponse=modelMapper.map(candidate, PositionResponse.class);
            return positionResponse;
        }
        throw new UserNotFoundException("Can't find the position");
    }

    @Override
    public String saveCandidateFeedback(long userId, int rate,String comment) {
        if(userRepository.existsById(userId) && candidateRepository.existsById(userId)){
            try {
                candidateRepository.saveRateAndComment(rate,comment);
                return "Comment saved";
            } catch (RuntimeException e) {
                throw new RuntimeException("Feedback not saved", e);
            }
        }
        throw new UserNotFoundException("No such kind of User");
    }
}