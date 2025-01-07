package com.aipoweredinterviewmonitoringsystem.interview_management_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class InterviewManagementServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewManagementServiceApplication.class, args);
	}

}
