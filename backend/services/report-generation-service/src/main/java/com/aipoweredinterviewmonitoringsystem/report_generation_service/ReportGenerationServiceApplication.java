package com.aipoweredinterviewmonitoringsystem.report_generation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ReportGenerationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReportGenerationServiceApplication.class, args);
	}

}
