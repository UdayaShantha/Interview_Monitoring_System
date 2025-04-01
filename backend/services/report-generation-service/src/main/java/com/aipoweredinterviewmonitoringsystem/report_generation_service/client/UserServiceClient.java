package com.aipoweredinterviewmonitoringsystem.report_generation_service.client;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.util.StandardResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "USER-MANAGEMENT-SERVICE" , url = "http://localhost:8081/api/v1/users")
public interface UserServiceClient {
    @GetMapping("/get/user-Details-by-userId")
    public ResponseEntity<StandardResponse> getUserDetailsByUserId(@RequestParam("userId") long userId);
}
