package com.aipoweredinterviewmonitoringsystem.user_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated.PaginatedCandidateGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.webjars.NotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
            throw new RuntimeException("No candidate found with id " + userId);
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
    public String deleteCandidate(Long userId) {
        candidateRepository.deleteById(userId);

        Interview interview = interviewFeignClient.getInterviewByCandidateId(userId);
        if(interview != null){
            Long interviewId = interview.getInterviewId();
            interviewFeignClient.deleteInterview(interviewId);
        }
        return "Candidate with id: " + userId + " deleted";
    }

    @Override
    @Transactional
    public CandidateUpdateDTO updateCandidate(Long userId, CandidateUpdateDTO candidateUpdateDTO) {
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
    public String getUserName(long userId) {
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

    @Override
    public PositionResponse getCandidatePosition(long userId) {
        try{
            if(candidateRepository.existsById(userId)) {
                Candidate candidate=candidateRepository.findPositionByuserId(userId);
                PositionResponse positionResponse=modelMapper.map(candidate, PositionResponse.class);
                return positionResponse;
            }
        }
        catch (Exception e){
            return null;
        }
        return null;
    }

    @Override
    public String saveCandidateFeedback(long userId, int rate,String comment) {
        if(userRepository.existsById(userId) && candidateRepository.existsById(userId)){
            try {
                candidateRepository.saveRateAndComment(rate,comment);
                return "Comment saved";
            }
            catch (RuntimeException e){
                return "Feddback not saved";
            }
        }
        return "Not such kind of User";
    }




}