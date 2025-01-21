package com.aipoweredinterviewmonitoringsystem.interview_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.repository.InterviewRepository;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    public InterviewDTO updateInterview(Long interviewId, InterviewDTO interviewDTO) {
        if(interviewRepository.existsById(interviewId)){
            Interview interview = interviewRepository.findById(interviewId).get();
            InterviewDTO interviewUpdateDTO = modelMapper.map(interview, InterviewDTO.class);
            interviewUpdateDTO.setCreatedAt(interviewDTO.getCreatedAt());
            interviewUpdateDTO.setStatus(interviewDTO.getStatus());
            interviewUpdateDTO.setStartTime(interviewDTO.getStartTime());
            interviewUpdateDTO.setScheduleDate(interviewDTO.getScheduleDate());
            Interview updatedInterview = modelMapper.map(interviewUpdateDTO, Interview.class);
            interviewRepository.save(updatedInterview);
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

}
