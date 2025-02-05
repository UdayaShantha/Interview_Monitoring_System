package com.aipoweredinterviewmonitoringsystem.interview_management_service.controller;



import com.aipoweredinterviewmonitoringsystem.interview_management_service.advisor.QuestionNotFoundException;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;



import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated.PaginatedInterviewGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.service.InterviewService;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
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

    @GetMapping("/all")
    public ResponseEntity<StandardResponse> getAllInterviews() {
        List<GetAllInterviewsDTO> allInterviews = interviewService.getAllInterviews();
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allInterviews),
                HttpStatus.OK
        );
    }

    @GetMapping(
            path="all/paginated",
            params={"page","size"}
    )
    public ResponseEntity<StandardResponse> getAllInterviewsPaginated(@RequestParam(defaultValue = "0") int page,
                                                                      @RequestParam(defaultValue = "10") int size) {
        PaginatedInterviewGetAllDTO paginatedInterviewGetAllDTO = interviewService.getAllInterviewsPaginated(page, size);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "Success", paginatedInterviewGetAllDTO),
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
    public ResponseEntity<StandardResponse> getInterviewByStatus(@PathVariable(value = "status") Status status) {
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

    @PutMapping("/status/{interviewId}")
    public ResponseEntity<StandardResponse> updateInterviewStatus(@PathVariable(value = "interviewId") long interviewId, @RequestBody InterviewStatusUpdateDTO interviewStatusUpdateDTO) {
        InterviewStatusUpdateDTO updatedInterview = interviewService.updateInterviewStatus(interviewId,interviewStatusUpdateDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",updatedInterview),
                HttpStatus.OK
        );

    }


    @GetMapping(value={"/get/interview/questions"},params = {"interviewId"})
    public ResponseEntity<StandardResponse> getInterviewQuestions(@RequestParam(value = "interviewId") long interviewId) {
        try {
            List<QuestionResponseDTO> questionResponseDTOS = interviewService.getInterviewQuestions(interviewId);
            if (questionResponseDTOS.isEmpty()) {
                throw new QuestionNotFoundException("Question Not Found");
            }
            return new ResponseEntity<>(new StandardResponse(200, "Success", questionResponseDTOS), HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(new StandardResponse(500, "Internal Server Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/completed-percentage")
    public ResponseEntity<StandardResponse> getCompletedInterviewPercentage() {
        double percentage = interviewService.getCompletedInterviewPercentage();
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", percentage),
                HttpStatus.OK
        );


    }
    @GetMapping("/success-rate")
    public ResponseEntity<StandardResponse> getSuccessRate() {
        double successRate = interviewService.calculateSuccessRate();
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", successRate),
                HttpStatus.OK
        );
    }


    @GetMapping("/projection/today")
    public ResponseEntity<StandardResponse> getTodayInterviewProjection() {
        double projectionPercentage = interviewService.calculateTodayProjection();
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", projectionPercentage + "%"),
                HttpStatus.OK
        );
    }


    @GetMapping("/progress/unfinished-percentage")
    public ResponseEntity<StandardResponse> getUnfinishedInterviewsPercentage() {
        double percentage = interviewService.calculateUnfinishedInterviewsPercentage();
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", percentage),
                HttpStatus.OK
        );
    }

    @GetMapping("/today-cancelled-percentage")
    public ResponseEntity<StandardResponse> getTodayCancelledPercentage() {
        double percentage = interviewService.getTodayCancelledInterviewsPercentage();
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", percentage),
                HttpStatus.OK
        );
    }

    @GetMapping("by-result/{result}")
    public ResponseEntity<StandardResponse> getInterviewByResult(@PathVariable(value = "result") Result result) {
        List<InterviewDTO> allInterviewsByResult = interviewService.getAllInterviewsByResult(result);
        return new ResponseEntity<>(
                new StandardResponse(200, "Success", allInterviewsByResult),
                HttpStatus.OK
        );
    }



}
