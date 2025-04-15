package com.aipoweredinterviewmonitoringsystem.report_generation_service.service;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.InterviewMetricsDto;
import org.springframework.stereotype.Service;

@Service
public interface ReportService {
    String saveReport(Long interviewId, Long candidateId, String candidateName, byte[] pdfBytes);

    ReportDownloadDTO getReportForDownload(Long reportId);

   // InterviewMetricsDto extractMetrics(InterviewMetricsDto);

   // InterviewMetricsDto fetchMetricsFromPythonService(Long interviewId);
//   public InterviewMetricsDto fetchMetricsFromPythonService(Long interviewId);


//    InterviewMetricsDto parseCsv(String csvContent);

  //  List<Map<String, String>> parseCsvToKeyValuePairs(String csvContent);
}
