package com.aipoweredinterviewmonitoringsystem.interview_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated.PaginatedInterviewGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.feign.UserFeignClient;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InterviewServiceIMPL implements InterviewService {

    @Autowired
    public InterviewRepository interviewRepository;

    @Autowired
    public ModelMapper modelMapper;

    @Autowired
    public UserFeignClient userFeignClient;

    public InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO) {
        Interview interview = modelMapper.map(interviewSaveDTO, Interview.class);
        interview.setStatus(Status.UPCOMING);
        interview.setCreatedAt(LocalDateTime.now());
        Interview savedInterview = interviewRepository.save(interview);
        return modelMapper.map(savedInterview, InterviewSaveDTO.class);
    }


    @Override
    public List<GetAllInterviewsDTO> getAllInterviews() {
        List<Interview> interviews = interviewRepository.findAll();

        List<GetAllInterviewsDTO> interviewDTOs = new ArrayList<>();
        for (Interview interview : interviews) {
            Long candidateId = interview.getCandidateId();
            if (candidateId != null && candidateId > 0) { // check if candidate ID is valid
                ResponseEntity<StandardResponse> response = userFeignClient.getCandidatePositionById(candidateId);
                if (response.getBody() != null && response.getBody().getData() != null) {
                    GetAllInterviewsDTO getAllInterviewsDTO = modelMapper.map(interview, GetAllInterviewsDTO.class);
                    getAllInterviewsDTO.setPositionType(response.getBody().getData().toString());
                    interviewDTOs.add(getAllInterviewsDTO);
                }
            } else {

                GetAllInterviewsDTO getAllInterviewsDTO = modelMapper.map(interview, GetAllInterviewsDTO.class);
                interviewDTOs.add(getAllInterviewsDTO);
            }
        }
        return interviewDTOs;
    }

    @Override
    public PaginatedInterviewGetAllDTO getAllInterviewsPaginated(int page, int size) {
        Page<Interview> interviews = interviewRepository.findAll(PageRequest.of(page, size));
        if (!interviews.hasContent()) {
            throw new EntityNotFoundException("No interviews found");
        }

        List<GetAllInterviewsDTO> interviewDTOs = new ArrayList<>();
        for (Interview interview : interviews) {
            Long candidateId = interview.getCandidateId();
            if (candidateId != null && candidateId > 0) { // check if candidate ID is valid
                ResponseEntity<StandardResponse> response = userFeignClient.getCandidatePositionById(candidateId);
                if (response.getBody() != null && response.getBody().getData() != null) {
                    GetAllInterviewsDTO getAllInterviewsDTO = modelMapper.map(interview, GetAllInterviewsDTO.class);
                    getAllInterviewsDTO.setPositionType(response.getBody().getData().toString());
                    interviewDTOs.add(getAllInterviewsDTO);
                }
            } else {

                GetAllInterviewsDTO getAllInterviewsDTO = modelMapper.map(interview, GetAllInterviewsDTO.class);
                interviewDTOs.add(getAllInterviewsDTO);
            }
        }

        PaginatedInterviewGetAllDTO paginatedInterviewGetAllDTO = new PaginatedInterviewGetAllDTO(
                interviewDTOs,
                interviews.getTotalElements()
        );

        return paginatedInterviewGetAllDTO;
    }

    @Override
    public InterviewStatusUpdateDTO updateInterviewStatus(Long interviewId, InterviewStatusUpdateDTO interviewStatusUpdateDTO) {
        if(interviewRepository.existsById(interviewId)){
            Interview interview = interviewRepository.findById(interviewId).get();

            // Validate if the status from the DTO is in the allowed list
            List<Status> allowedStatuses = Arrays.asList(Status.UPCOMING, Status.COMPLETED, Status.POSTPONED);
            if (!allowedStatuses.contains(interviewStatusUpdateDTO.getStatus())) {
                throw new IllegalArgumentException("Invalid status selected");
            }

            interview.setStatus(interviewStatusUpdateDTO.getStatus());
            Interview updatedInterview = interviewRepository.save(interview);
            interviewStatusUpdateDTO = modelMapper.map(updatedInterview, InterviewStatusUpdateDTO.class);
            return interviewStatusUpdateDTO;
        }
        else {
            throw new RuntimeException("No such interview");
        }
    }


    @Override
    public GetInterviewDTO getInterviewById(Long interviewId) {
        if(interviewRepository.existsById(interviewId)){
            Interview interview = interviewRepository.findById(interviewId).get();
            GetInterviewDTO dto = modelMapper.map(interview, GetInterviewDTO.class);
            return dto;
        }
        else {
            throw new RuntimeException("No such interview");
        }
    }

    @Override
    public String deleteInterview(Long interviewId) {
        interviewRepository.deleteById(interviewId);
        return "Inteview with id: "+interviewId.toString() + " deleted";
    }

    @Override
    public InterviewUpdateDTO updateInterview(Long interviewId, InterviewUpdateDTO interviewUpdateDTO) {
        if(interviewRepository.existsById(interviewId)){
            Interview interview = interviewRepository.findById(interviewId).get();
            interview.setStartTime(interviewUpdateDTO.getStartTime());
            interview.setScheduleDate(interviewUpdateDTO.getScheduleDate());
            interview.setDuration(interviewUpdateDTO.getDuration());
            interview.setStatus(interviewUpdateDTO.getStatus());

            Interview updatedInterview = interviewRepository.save(interview);
            interviewUpdateDTO = modelMapper.map(updatedInterview, InterviewUpdateDTO.class);
            return interviewUpdateDTO;
        }
        else {
            throw new RuntimeException("No such interview");
        }
    }

    @Override
    public List<InterviewDTO> getAllInterviewsByStatus(Status status) {
        List<Interview> interviews = interviewRepository.findAllByStatusEquals(status);
        List<InterviewDTO> interviewDTOs = new ArrayList<>();
        for (Interview interview : interviews) {
            interviewDTOs.add(modelMapper.map(interview, InterviewDTO.class));
        }
        return interviewDTOs;
    }

    @Override
    public Interview getInterviewByCandidateId(Long candidateId) {
        if(interviewRepository.existsByCandidateId(candidateId)){
            return interviewRepository.findByCandidateId(candidateId);
        }
        return null;
    }

    @Override
    public double getCompletedInterviewPercentage() {

        long totalInterviews = interviewRepository.count();
        long completedInterviews = interviewRepository.countByStatus(Status.COMPLETED);

        if (totalInterviews == 0) {
            return 0.0;
        }

        return (double) completedInterviews / totalInterviews * 100;
    }

    @Override
    public double calculateSuccessRate() {

        List<Interview> completedInterviews = interviewRepository.findAllByStatusEquals(Status.COMPLETED);
        int totalCompleted = completedInterviews.size();

        if (totalCompleted == 0) {
            return 0.0;
        }
        long selectedCount = completedInterviews.stream()
                .filter(interview -> interview.getResult() == Result.SELECTED)
                .count();

        return (selectedCount / (double) totalCompleted) * 100;
    }


    @Override
    public double calculateTodayProjection() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Interview> todayInterviews = interviewRepository.findAllByScheduleDateEquals(today);

        int totalInterviews = todayInterviews.size();


        long completedInterviews = todayInterviews.stream()
                .filter(interview ->
                        interview.getStatus() == Status.COMPLETED ||
                                (interview.getStartTime() != null && interview.getStartTime().isBefore(now))
                ).count();


        return totalInterviews > 0 ? ((double) completedInterviews / totalInterviews) * 100 : 0.0;
    }



    @Override
    public double calculateUnfinishedInterviewsPercentage() {
        long totalInterviewsToday = interviewRepository.countTotalInterviewsToday();
        long unfinishedInterviewsToday = interviewRepository.countUnfinishedInterviewsToday();

        if (totalInterviewsToday == 0) {
            return 0.0;
        }

        return ((double) unfinishedInterviewsToday / totalInterviewsToday) * 100;
    }

    @Override
    public double getTodayCancelledInterviewsPercentage() {
        LocalDate today = LocalDate.now();
        long cancelledCount = interviewRepository.countByStatusAndDate(Status.CANCELLED, today);
        long totalCount = interviewRepository.countByDate(today);

        if (totalCount == 0) {
            return 0.0;
        }

        return (double) cancelledCount / totalCount * 100;
    }


    @Override
    public List<InterviewDTO> getAllInterviewsByResult(Result result) {
        List<Interview> interviews = interviewRepository.findAllByResultEquals(result);
        List<InterviewDTO> interviewDTOs = new ArrayList<>();
        for (Interview interview : interviews) {
            interviewDTOs.add(modelMapper.map(interview, InterviewDTO.class));
        }
        return interviewDTOs;
    }


    @Override
    public Page<GetAllInterviewsDTO> filterInterviews(String positionType, Status status, LocalDate scheduleDate, String scheduleTimeStatus, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Interview> filteredInterviews = interviewRepository.findAll(pageable);

        List<Interview> interviewList = filteredInterviews.getContent();

        if (positionType != null && !positionType.isEmpty()) {
            interviewList = interviewList.stream()
                    .filter(interview -> {
                        ResponseEntity<StandardResponse> response = userFeignClient.getCandidatePositionById(interview.getCandidateId());
                        return response.getBody() != null && response.getBody().getData() != null &&
                                response.getBody().getData().toString().equalsIgnoreCase(positionType);
                    })
                    .collect(Collectors.toList());
        }

        if (status != null) {
            interviewList = interviewList.stream()
                    .filter(interview -> interview.getStatus() == status)
                    .collect(Collectors.toList());
        }

        if (scheduleDate != null) {
            interviewList = interviewList.stream()
                    .filter(interview -> interview.getScheduleDate().equals(scheduleDate))
                    .collect(Collectors.toList());
        }

        if (scheduleTimeStatus != null && !scheduleTimeStatus.isEmpty()) {
            LocalDate today = LocalDate.now();
            interviewList = interviewList.stream()
                    .filter(interview -> {
                        LocalDate interviewDate = interview.getScheduleDate();
                        switch (scheduleTimeStatus.toLowerCase()) {
                            case "today":
                                return interviewDate.isEqual(today);
                            case "tomorrow":
                                return interviewDate.isEqual(today.plusDays(1));
                            case "thisweek":
                                return interviewDate.isAfter(today.minusDays(1)) &&
                                        interviewDate.isBefore(today.plusDays(7));
                            case "thismonth":
                                return interviewDate.getMonth() == today.getMonth() &&
                                        interviewDate.getYear() == today.getYear();
                            default:
                                return false;
                        }
                    })
                    .collect(Collectors.toList());
        }

        List<GetAllInterviewsDTO> interviewDTOs = interviewList.stream()
                .map(interview -> {
                    GetAllInterviewsDTO dto = modelMapper.map(interview, GetAllInterviewsDTO.class);
                    dto.setPositionType(userFeignClient.getCandidatePositionById(interview.getCandidateId()).getBody().getData().toString());
                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(interviewDTOs, pageable, filteredInterviews.getTotalElements());
    }




}