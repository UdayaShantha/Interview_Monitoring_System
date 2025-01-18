package com.aipoweredinterviewmonitoringsystem.user_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.GetCandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;
import com.aipoweredinterviewmonitoringsystem.user_management_service.feign.InterviewFeignClient;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.CandidateRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.HrTeamRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.TechnicalTeamRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.UserRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

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
    public CandidateSaveDTO saveCandidate(CandidateSaveDTO candidateSaveDTO) {
        Candidate candidate = modelMapper.map(candidateSaveDTO, Candidate.class);
        candidate.setUserType(UserType.CANDIDATE);
        candidate.setCreatedAt(LocalDateTime.now());
        Candidate savedCandidate = candidateRepository.save(candidate);

        InterviewSaveDTO interviewSaveDTO = new InterviewSaveDTO();
        interviewSaveDTO.setCandidateId(savedCandidate.getUserId());
        interviewSaveDTO.setScheduleDate(candidateSaveDTO.getScheduleDate());
        interviewSaveDTO.setStartTime(candidateSaveDTO.getStartTime());

        ResponseEntity<StandardResponse> response = interviewFeignClient.saveInterview(interviewSaveDTO);

        CandidateSaveDTO savedCandidateDTO = modelMapper.map(savedCandidate, CandidateSaveDTO.class);
        if (response.getBody() != null && response.getBody().getData() != null) {
            Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
            if (data.containsKey("scheduleDate") && data.containsKey("startTime")) {
                savedCandidateDTO.setScheduleDate(LocalDate.parse(data.get("scheduleDate").toString()));
                savedCandidateDTO.setStartTime(LocalTime.parse(data.get("startTime").toString()));
            }
        }

        return savedCandidateDTO;
    }

    @Override
    public GetCandidateDTO getCandidateById(Long userId) {
        if (candidateRepository.existsById(userId)) {
            Candidate candidate = candidateRepository.findById(userId).get();
            GetCandidateDTO getCandidateDTO = modelMapper.map(candidate, GetCandidateDTO.class);

            ResponseEntity<StandardResponse> response = interviewFeignClient.getInterviewById(candidate.getUserId());
            if (response.getBody() != null && response.getBody().getData() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
                if (data.containsKey("duration") && data.containsKey("scheduleDate") && data.containsKey("startTime")) {
                    getCandidateDTO.setDuration(Double.parseDouble(data.get("duration").toString()));
                    getCandidateDTO.setScheduleDate(LocalDate.parse(data.get("scheduleDate").toString()));
                    getCandidateDTO.setStartTime(LocalTime.parse(data.get("startTime").toString()));
                }
            }
            return getCandidateDTO;
        } else {
            throw new RuntimeException("No candidate found with id " + userId);
        }

    }

    @Override
    public List<CandidateDTO> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<CandidateDTO> candidateDTOs = new ArrayList<>();
        for (Candidate candidate : candidates) {
            candidateDTOs.add(modelMapper.map(candidate, CandidateDTO.class));
        }

        return candidateDTOs;
    }

    @Override
    @Transactional
    public String deleteCandidate(Long userId) {
        candidateRepository.deleteById(userId);
        userRepository.deleteById(userId);


        return "Candidate with id: " + userId + " deleted";
    }

    @Override
    @Transactional
    public CandidateDTO updateCandidate(Long userId, CandidateDTO candidateDTO) {
        Candidate candidate = candidateRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No candidate found with id " + userId));

        updateCandidateFromDTO(candidate, candidateDTO);

        Candidate savedCandidate = candidateRepository.save(candidate);
        return modelMapper.map(savedCandidate, CandidateDTO.class);
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
            }
            catch (RuntimeException e){
                return "Comment not saved";
            }
        }
        return "Not such kind of User";
    }

    @Override
    public String getName(long userId) {
        if(userRepository.existsById(userId)){
            try {
                if (hrTeamRepository.existsById(userId)) {
                    return hrTeamRepository.findNameByUserId(userId);
                }
                if (technicalTeamRepository.existsById(userId)) {
                    return technicalTeamRepository.findNameByUserId(userId);
                }
            }
            catch (RuntimeException e){
                return "Can't get the logged user's name";
            }
        }
        return "Not such kind of User";
    }




    private void updateCandidateFromDTO(Candidate candidate, CandidateDTO dto) {
        candidate.setName(dto.getName());
        candidate.setPhone(dto.getPhone());
        candidate.setNic(dto.getNic());
        candidate.setAddress(dto.getAddress());
        candidate.setEmail(dto.getEmail());
        candidate.setBirthday(dto.getBirthday());
        candidate.setPositionType(dto.getPositionType());
        candidate.setPhotos(dto.getPhotos());
    }
}



