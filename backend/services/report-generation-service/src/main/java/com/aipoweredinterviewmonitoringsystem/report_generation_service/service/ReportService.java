package com.aipoweredinterviewmonitoringsystem.report_generation_service.service;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import org.springframework.stereotype.Service;

@Service
public interface ReportService {
    String saveReport(Long interviewId, Long candidateId, String candidateName, byte[] pdfBytes);

    ReportDownloadDTO getReportForDownload(Long reportId);
}
