package com.aipoweredinterviewmonitoringsystem.report_generation_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.MetricValue;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.InterviewMetricsDto;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.PythonReportResponse;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.repository.ReportRepository;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportServiceIMPL implements ReportService {

    private final ReportRepository reportRepository;

    private final WebClient webClient;


    @Autowired
    public ReportServiceIMPL(ReportRepository reportRepository , WebClient webClient) {
        this.reportRepository = reportRepository;
        this.webClient = webClient;
    }

    public String saveReport(Long interviewId, Long candidateId, String candidateName, byte[] pdfBytes) {
        Report report = new Report();
        report.setInterviewId(interviewId);
        report.setCandidateId(candidateId);
        report.setCandidateName(candidateName);
        report.setPdfFile(pdfBytes);
        report.setGeneratedAt(LocalDate.now());
        reportRepository.save(report);

        return "Report saved successfully";
    }

    @Override
    public ReportDownloadDTO getReportForDownload(Long reportId) {
        Report report = reportRepository.findById(reportId )
                .orElseThrow(() -> new RuntimeException("Report not found"));

        ReportDownloadDTO reportDownloadDTO = new ReportDownloadDTO(report.getCandidateName(), report.getPdfFile());

        return reportDownloadDTO;
    }


    // Fetch json from Python service ------------------------------------------------------
    @Override
    public InterviewMetricsDto fetchMetricsFromPythonService(Long interviewId) {
        // Fetch data from Python service
        try {
            String url = "/monitoring/report/" + interviewId;
            System.out.println("Calling Python service at: " + url);

            PythonReportResponse response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, res -> {
                        System.err.println("Python service error! Status: " + res.statusCode());
                        return res.bodyToMono(String.class)
                                .flatMap(body -> {
                                    System.err.println("Error response body: " + body);
                                    return Mono.error(new RuntimeException("Python service error: " + body));
                                });
                    })
                    .bodyToMono(PythonReportResponse.class)
                    .doOnNext(r -> System.out.println("Raw Python response: " + r))
                    .block();

            System.out.println("Python service response received successfully");
            return mapToInterviewMetricsDto(response.getData());

        } catch (Exception e) {
            System.err.println("Critical error in fetchMetricsFromPythonService: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch metrics: " + e.getMessage(), e);
        }

    }

    private InterviewMetricsDto mapToInterviewMetricsDto(List<MetricValue> metrics) {
        InterviewMetricsDto dto = new InterviewMetricsDto();

        for (MetricValue mv : metrics) {
            switch (mv.getMetric()) {
                case "Interview Duration":
                    dto.setInterviewDurationSeconds(parseValue(mv.getValue(), "seconds"));
                    break;
                case "Off-Screen Duration":
                    dto.setOffScreenDurationSeconds(parseValue(mv.getValue(), "seconds"));
                    break;
                case "Average Head Rotation":
                    dto.setAverageHeadRotationDegrees(parseValue(mv.getValue(), "degrees"));
                    break;
                case "angry":
                    dto.setAngryPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "disgust":
                    dto.setDisgustPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "fear":
                    dto.setFearPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "happy":
                    dto.setHappyPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "sad":
                    dto.setSadPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "surprise":
                    dto.setSurprisePercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "neutral":
                    dto.setNeutralPercentage(parseValue(mv.getValue(), "%"));
                    break;
                case "Analyzed Frames":
                    dto.setAnalyzedFrames(parseInt(mv.getValue()));
                    break;
                case "Valid Face Detections":
                    dto.setValidFaceDetections(parseInt(mv.getValue()));
                    break;
            }
        }
        return dto;
    }

    private Double parseValue(String value, String unit) {
        if (value == null || value.isEmpty()) return 0.0;
        try {
            return Double.parseDouble(value.replace(unit, "").trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private Integer parseInt(String value) {
        if (value == null || value.isEmpty()) return 0;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

}
