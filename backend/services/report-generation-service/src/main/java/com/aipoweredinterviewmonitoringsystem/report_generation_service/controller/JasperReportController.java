package com.aipoweredinterviewmonitoringsystem.report_generation_service.controller;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.AnswerAccuracyDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.EmotionData;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.JasperReportService;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.ReportService;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.awt.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/report")
public class JasperReportController {

    private final JasperReportService jasperReportService;

    private final ReportService reportService;

    @Autowired
    public JasperReportController(JasperReportService jasperReportService, ReportService reportService) {
        this.jasperReportService = jasperReportService;
        this.reportService = reportService;
    }

    @GetMapping(path = "/generate" , params = {"candidateId", "interviewId", "cadidateName"})
    public ResponseEntity<byte[]> generateReport(
            @RequestParam(value = "candidateId") Long candidateId,
            @RequestParam(value = "interviewId") Long interviewId,
            @RequestParam(value = "cadidateName") String cadidateName
    ) {
        try {
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("Name", cadidateName);
            parameters.put("NIC", "2001423617V");
            parameters.put("Position", "Software Engineer");
            parameters.put("Email", "abcd@gmail.com");
            parameters.put("Contact_number", "0712345678");
            parameters.put("Duration", "30 minutes");
            parameters.put("Verification", "Identified");
            parameters.put("Interview_id", 22L);
            parameters.put("Address", "No 123, Colombo 07");
            parameters.put("Date", "2021-09-20");

            // Emotion Data
            List<EmotionData> emotionDataList = new ArrayList<>();
            emotionDataList.add(new EmotionData("Confident", 40));
            emotionDataList.add(new EmotionData("Neutral", 15));
            emotionDataList.add(new EmotionData("Confuse", 25));
            emotionDataList.add(new EmotionData("Fear", 5));
            emotionDataList.add(new EmotionData("Others", 10));

            // Convert to JRBeanCollectionDataSource
            JRBeanCollectionDataSource emotionDataSource = new JRBeanCollectionDataSource(emotionDataList);
            parameters.put("emotionDataSet", emotionDataSource);

            //Answer Accuracy Data
            List<AnswerAccuracyDTO> answerAccuracyDataList = new ArrayList<>();
            answerAccuracyDataList.add(new AnswerAccuracyDTO(1L, 70));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(2L, 80));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(3L, 90));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(4L, 75));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(5L, 55));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(6L, 85));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(7L, 35));
            answerAccuracyDataList.add(new AnswerAccuracyDTO(8L, 65));

            // Convert to JRBeanCollectionDataSource
            JRBeanCollectionDataSource accuracyDataSource = new JRBeanCollectionDataSource(answerAccuracyDataList);
            parameters.put("answerDataSet", accuracyDataSource);

            byte[] pdfBytes = jasperReportService.generateReport(parameters);

            String saveReport = reportService.saveReport(candidateId, interviewId, cadidateName, pdfBytes);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("report.pdf")
                            .build()
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/download/{reportId}")
    public ResponseEntity<byte[]> downloadReportById(
            @RequestParam(value = "reportId") Long reportId
    ){
        try {
            ReportDownloadDTO reportDownloadDTO = reportService.getReportForDownload(reportId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename(reportDownloadDTO.getCandidateName()+"_report.pdf")
                            .build()
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportDownloadDTO.getPdfContent());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}