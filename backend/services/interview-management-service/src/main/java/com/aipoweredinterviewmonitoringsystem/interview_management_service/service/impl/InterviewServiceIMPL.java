package com.aipoweredinterviewmonitoringsystem.interview_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated.PaginatedInterviewGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.feign.UserFeignClient;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class InterviewServiceIMPL implements InterviewService {

    @Autowired
    public InterviewRepository interviewRepository;

    @Autowired
    public ModelMapper modelMapper;

    @Autowired
    public UserFeignClient userFeignClient;

    @Autowired
    private WebClient webClient;

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
            Candidate candidate=interview.getCandidate();
            Long candidateId = candidate.getUserId();
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
            Candidate candidate=interview.getCandidate();
            Long candidateId = candidate.getUserId();
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
            List<Status> allowedStatuses = Arrays.asList(Status.UPCOMING, Status.IN_PROGRESS, Status.COMPLETED, Status.POSTPONED);
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
    public List<QuestionResponseDTO> getInterviewQuestions(long interviewId) {
        if(interviewRepository.existsById(interviewId)){
            List<QuestionResponseDTO> questionResponseDTOs = new ArrayList<>();
            Candidate candidate=interviewRepository.findById(interviewId).get().getCandidate();
            if(candidate.getPositionType().equals("SOFTWARE_ENGINEER")){
                questionResponseDTOs.add(
                        webClient.get().uri("localhost:8083/api/v1/questions//get/interview/questions").retrieve().bodyToMono(QuestionResponseDTO.class).block()
                );
            }
            if(candidate.getPositionType().equals("QA")){
                questionResponseDTOs.add(
                        webClient.get().uri("localhost:8083/api/v1/questions//get/interview/questions").retrieve().bodyToMono(QuestionResponseDTO.class).block()
                );
            }
            if(candidate.getPositionType().equals("DATA_ANALYTICS")){
                questionResponseDTOs.add(
                        webClient.get().uri("localhost:8083/api/v1/questions//get/interview/questions").retrieve().bodyToMono(QuestionResponseDTO.class).block()
                );
            }
            return questionResponseDTOs;
        }
        else{
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
    public List<InterviewDTO> getAllInterviewsByStatus(String status) {
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



}
