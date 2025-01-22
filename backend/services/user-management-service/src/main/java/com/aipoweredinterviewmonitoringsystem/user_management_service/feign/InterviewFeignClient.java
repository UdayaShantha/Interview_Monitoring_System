package com.aipoweredinterviewmonitoringsystem.user_management_service.feign;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.ScheduleDate;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@FeignClient(name = "INTERVIEW-MANAGEMENT-SERVICE",url = "http://localhost:8082")
public interface InterviewFeignClient {
    @PostMapping("api/v1/interviews")
    ResponseEntity<StandardResponse> saveInterview(@RequestBody InterviewSaveDTO interviewSaveDTO);

    @GetMapping("api/v1/interviews/{id}")
    ResponseEntity<StandardResponse> getInterviewById(@PathVariable(value = "id") Long interviewId);

    @GetMapping("api/v1/interviews/by-status/{status}")
    ResponseEntity<StandardResponse> getInterviewByStatus(@PathVariable(value = "status") Status status);

    @GetMapping("api/v1/interviews/by-schedule-date/{scheduleDate}")
    ResponseEntity<StandardResponse> getAllInterviewsByScheduleDate(@PathVariable(value = "scheduleDate") LocalDate scheduleDate);

    @GetMapping("api/v1/interviews/by-schedule-filter/{scheduleFilter}")
    ResponseEntity<StandardResponse>getAllInterviewsByScheduleFilter(@PathVariable(value = "scheduleFilter") ScheduleDate scheduleFilter);





}
