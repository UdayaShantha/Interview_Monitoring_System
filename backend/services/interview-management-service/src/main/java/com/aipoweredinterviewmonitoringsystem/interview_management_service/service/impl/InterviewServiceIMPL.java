package com.aipoweredinterviewmonitoringsystem.interview_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewUpdateDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewServiceIMPL implements InterviewService {

    @Autowired
    public InterviewRepository interviewRepository;

    @Autowired
    public ModelMapper modelMapper;

    public InterviewSaveDTO saveInterview(InterviewSaveDTO interviewSaveDTO) {
        Interview interview = modelMapper.map(interviewSaveDTO, Interview.class);
        interview.setStatus(Status.UPCOMING);
        interview.setCreatedAt(LocalDateTime.now());
        Interview savedInterview = interviewRepository.save(interview);
        return modelMapper.map(savedInterview, InterviewSaveDTO.class);
    }

    @Override
    public List<InterviewDTO> getAllInterviews() {
        List<Interview> interviews = interviewRepository.findAll();
        List<InterviewDTO> interviewDTOs = new ArrayList<>();
        for (Interview interview : interviews) {
            interviewDTOs.add(modelMapper.map(interview, InterviewDTO.class));
        }
        return interviewDTOs;
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
