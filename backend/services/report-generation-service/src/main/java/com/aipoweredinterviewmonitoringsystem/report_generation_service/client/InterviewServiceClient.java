package com.aipoweredinterviewmonitoringsystem.report_generation_service.client;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.util.StandardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "INTERVIEW-MANAGEMENT-SERVICE" ,url = "http://localhost:8082/api/v1/interviews")
public interface InterviewServiceClient {
    @GetMapping("/get/interviews-Details-by-interviewId")
    ResponseEntity<StandardResponse> getInterviewDetailsByInterviewId(@RequestParam("interviewId") long interviewId);
}
