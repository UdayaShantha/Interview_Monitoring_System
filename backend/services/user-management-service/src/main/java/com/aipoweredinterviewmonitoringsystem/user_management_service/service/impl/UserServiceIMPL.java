package com.aipoweredinterviewmonitoringsystem.user_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.ScheduleDate;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
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
    public String saveComment(long userId, String comment) {
        if (userRepository.existsById(userId)) {
            try {
                if (hrTeamRepository.existsById(userId)) {
                    hrTeamRepository.saveComment(userId, comment);
                    return "Comment saved";
                }
                if (technicalTeamRepository.existsById(userId)) {
                    technicalTeamRepository.saveComment(userId, comment);
                    return "Comment saved";
                }
            } catch (RuntimeException e) {
                return "Comment not saved";
            }
        }
        return "Not such kind of User";
    }

    @Override
    public String getName(long userId) {
        if (userRepository.existsById(userId)) {
            try {
                if (hrTeamRepository.existsById(userId)) {
                    return hrTeamRepository.findNameByUserId(userId);
                }
                if (technicalTeamRepository.existsById(userId)) {
                    return technicalTeamRepository.findNameByUserId(userId);
                }
            } catch (RuntimeException e) {
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


    @Override
    public List<CandidateDTO> filterCandidates(PositionType positionType, Status status, LocalDate scheduleDate, ScheduleDate scheduleFilter) {
        List<Candidate> candidates = candidateRepository.findAll();

        // Filter by PositionType
        if (positionType != null) {
            candidates = candidates.stream()
                    .filter(candidate -> candidate.getPositionType().equals(positionType))
                    .collect(Collectors.toList());
        }

        // Filter by Status
        if (status != null) {
            candidates = candidates.stream()
                    .filter(candidate -> {
                        InterviewDTO interview = (InterviewDTO) interviewFeignClient
                                .getInterviewById(candidate.getUserId())
                                .getBody()
                                .getData();
                        return interview != null && interview.getStatus().equals(status);
                    })
                    .collect(Collectors.toList());
        }

        // Filter by ScheduleDate
        if (scheduleDate != null || scheduleFilter != null) {
            candidates = candidates.stream()
                    .filter(candidate -> {
                        InterviewDTO interview = (InterviewDTO) interviewFeignClient
                                .getInterviewById(candidate.getUserId())
                                .getBody()
                                .getData();
                        if (interview == null || interview.getScheduleDate() == null) {
                            return false;
                        }
                        LocalDate interviewDate = interview.getScheduleDate();

                        switch (scheduleFilter) {
                            case TODAY:
                                return interviewDate.isEqual(LocalDate.now());

                            case TOMORROW:
                                return interviewDate.isEqual(LocalDate.now().plusDays(1));

                            case THIS_WEEK:
                                return interviewDate.isAfter(LocalDate.now().minusDays(1)) &&
                                        interviewDate.isBefore(LocalDate.now().plusDays(7));

                            case THIS_MONTH:
                                return interviewDate.getMonth().equals(LocalDate.now().getMonth()) &&
                                        interviewDate.getYear() == LocalDate.now().getYear();

                            default:
                                return scheduleDate != null && interviewDate.equals(scheduleDate);
                        }
                    })
                    .collect(Collectors.toList());
        }

        return candidates.stream()
                .map(candidate -> {
                    CandidateDTO dto = new CandidateDTO();
                    dto.setName(candidate.getName());
                    dto.setNic(candidate.getNic());
                    dto.setEmail(candidate.getEmail());
                    dto.setAddress(candidate.getAddress());
                    dto.setPhone(candidate.getPhone());
                    dto.setBirthday(candidate.getBirthday());
                    dto.setPositionType(candidate.getPositionType());
                    candidate.setPhotos(dto.getPhotos());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}













