package com.aipoweredinterviewmonitoringsystem.interview_management_service.controller;


import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewUpdateDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/v1/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    public ResponseEntity<StandardResponse> saveInterview(@RequestBody InterviewSaveDTO interviewSaveDTO) {
        InterviewSaveDTO savedInterviewDTO = interviewService.saveInterview(interviewSaveDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(201,"Success",savedInterviewDTO),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<StandardResponse> getAllInterviews() {
        List<InterviewDTO> allInterviews = interviewService.getAllInterviews();
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allInterviews),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse> getInterviewById(@PathVariable(value = "id") Long interviewId) {
        GetInterviewDTO getInterviewDTO = interviewService.getInterviewById(interviewId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",getInterviewDTO),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponse> deleteInterview(@PathVariable(value = "id") Long interviewId) {
        String message = interviewService.deleteInterview(interviewId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",message),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse> updateInterview(@PathVariable(value = "id") Long interviewId, @RequestBody InterviewUpdateDTO interviewUpdateDTO) {
        InterviewUpdateDTO updatedInterview = interviewService.updateInterview(interviewId,interviewUpdateDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",updatedInterview),
                HttpStatus.OK
        );

    }


    @GetMapping("by-status/{status}")
    public ResponseEntity<StandardResponse> getInterviewByStatus(@PathVariable(value = "status") String status) {
        List<InterviewDTO> allInterviewsByStatus = interviewService.getAllInterviewsByStatus(status);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allInterviewsByStatus),
                HttpStatus.OK
        );
    }

    @GetMapping("/candidate/{candidateId}")
    Interview getInterviewByCandidateId(@PathVariable(value = "candidateId") Long candidateId){
        return interviewService.getInterviewByCandidateId(candidateId);
    }


}
