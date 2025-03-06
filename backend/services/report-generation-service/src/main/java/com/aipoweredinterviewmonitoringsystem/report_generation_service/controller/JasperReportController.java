package com.aipoweredinterviewmonitoringsystem.report_generation_service.controller;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.JasperReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/report")
public class JasperReportController {
    @Autowired
    private JasperReportService jasperReportService;

    public JasperReportController(JasperReportService jasperReportService) {
        this.jasperReportService = jasperReportService;
    }

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateReport() {
        try {
            // Parameters for the report
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("Name", "John Doe");
            parameters.put("NIC", "2001423617V");
            parameters.put("Position", "Software Engineer");
            parameters.put("Email", "abcd@gmail.com");
            parameters.put("Contact_Number", "0712345678");
            parameters.put("Duration", "30 minutes");

            // Generate the PDF as a byte array
            byte[] pdfBytes = jasperReportService.generateReport(parameters);

            // Set HTTP headers for the response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "report.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
