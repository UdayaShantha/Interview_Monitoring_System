package com.aipoweredinterviewmonitoringsystem.interview_management_service.feign;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.response.QuestionResponseDTO;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "QUESTION-MANAGEMENT-SERVICE",url = "http://localhost:8083")
public interface QuestionFeignClient {

    @GetMapping(value = {"/get/interview/questions"}, params = {"positionType"})
    ResponseEntity<StandardResponse> getInterviewQuestionsShuffle(@RequestParam(value = "positionType") String positionType);

}
