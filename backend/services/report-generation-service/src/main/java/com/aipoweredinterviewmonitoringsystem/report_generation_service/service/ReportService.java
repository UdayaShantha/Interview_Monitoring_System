package com.aipoweredinterviewmonitoringsystem.report_generation_service.service;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.InterviewMetricsDto;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;

@Service
public interface ReportService {
    String saveReport(Long interviewId, Long candidateId, String candidateName, byte[] pdfBytes);

    ReportDownloadDTO getReportForDownload(Long reportId);

    InterviewMetricsDto extractMetrics(List<Map<String, String>> csvRows);

    String fetchCsvFromPythonService(Long interviewId);

    InterviewMetricsDto parseCsv(String csvContent);

    List<Map<String, String>> parseCsvToKeyValuePairs(String csvContent);
}
