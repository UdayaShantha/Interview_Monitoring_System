package com.aipoweredinterviewmonitoringsystem.interview_management_service.feign;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.util.StandardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "USER-MANAGEMENT-SERVICE",url = "http://localhost:8081")
public interface UserFeignClient {
    @GetMapping("api/v1/users/candidate/position/{id}")
    ResponseEntity<StandardResponse> getCandidatePositionById(@PathVariable(value = "id") Long userId);


}
