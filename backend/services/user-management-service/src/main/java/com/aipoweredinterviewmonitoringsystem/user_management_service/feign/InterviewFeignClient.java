package com.aipoweredinterviewmonitoringsystem.user_management_service.feign;


import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.InterviewSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "INTERVIEW-MANAGEMENT-SERVICE",url = "http://localhost:8082")
public interface InterviewFeignClient {
    @PostMapping("api/v1/interviews")
    ResponseEntity<StandardResponse> saveInterview(@RequestBody InterviewSaveDTO interviewSaveDTO);

    @GetMapping("api/v1/interviews/{id}")
    ResponseEntity<StandardResponse> getInterviewById(@PathVariable(value = "id") Long interviewId);

    @DeleteMapping("api/v1/interviews/{id}")
    ResponseEntity<StandardResponse> deleteInterview(@PathVariable(value = "id") Long InterviewId);


}