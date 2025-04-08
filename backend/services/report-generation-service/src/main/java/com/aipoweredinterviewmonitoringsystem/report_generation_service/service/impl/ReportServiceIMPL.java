package com.aipoweredinterviewmonitoringsystem.report_generation_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.InterviewMetricsDto;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.repository.ReportRepository;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.ReportService;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.StringReader;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@Service
public class ReportServiceIMPL implements ReportService {

    private final ReportRepository reportRepository;

    @Autowired
    public ReportServiceIMPL(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
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


    // Fetch CSV from Python service ------------------------------------------------------
    @Override
    public String fetchCsvFromPythonService(Long interviewId) {
        String url = "http://127.0.0.1:8001/monitoring/report/" + interviewId;
        return WebClient.create()
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    // Parse CSV into InterviewMetricsDto
    @Override
    public InterviewMetricsDto parseCsv(String csvContent) {
        List<Map<String, String>> rows = parseCsvToKeyValuePairs(csvContent);
        return extractMetrics(rows);
    }

    @Override
    public List<Map<String, String>> parseCsvToKeyValuePairs(String csvContent) {
        try (CSVReader reader = new CSVReader(new StringReader(csvContent))) {
            HeaderColumnNameTranslateMappingStrategy<Map<String, String>> strategy =
                    new HeaderColumnNameTranslateMappingStrategy<>();
            strategy.setType((Class<? extends Map<String, String>>)(Class<?>) Map.class);

            return new CsvToBeanBuilder<Map<String, String>>(reader)
                    .withMappingStrategy(strategy)
                    .build()
                    .parse();
        } catch (Exception e) {
            throw new RuntimeException("CSV parsing failed", e);
        }
    }

    //--- Extract the CSV file ----------------------------------
    @Override
    public InterviewMetricsDto extractMetrics(List<Map<String, String>> csvRows) {
        InterviewMetricsDto dto = new InterviewMetricsDto();

        for (Map<String, String> row : csvRows) {
            String metric = row.get("Metric");
            String value = row.get("Value");

            if (metric == null || value == null) continue;

            switch (metric.trim()) {
                case "Interview Duration":
                    dto.setInterviewDurationSeconds(parseDouble(value.replace(" seconds", "")));
                    break;
                case "Off-Screen Duration":
                    dto.setOffScreenDurationSeconds(parseDouble(value.replace(" seconds", "")));
                    break;
                case "Average Head Rotation":
                    dto.setAverageHeadRotationDegrees(parseDouble(value.replace(" degrees", "")));
                    break;
                case "angry":
                    dto.setAngryPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "disgust":
                    dto.setDisgustPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "fear":
                    dto.setFearPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "happy":
                    dto.setHappyPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "sad":
                    dto.setSadPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "surprise":
                    dto.setSurprisePercentage(parseDouble(value.replace("%", "")));
                    break;
                case "neutral":
                    dto.setNeutralPercentage(parseDouble(value.replace("%", "")));
                    break;
                case "Analyzed Frames":
                    dto.setAnalyzedFrames(Integer.parseInt(value));
                    break;
                case "Valid Face Detections":
                    dto.setValidFaceDetections(Integer.parseInt(value));
                    break;
            }
        }

        return dto;
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0; // or throw an error
        }
    }
}
