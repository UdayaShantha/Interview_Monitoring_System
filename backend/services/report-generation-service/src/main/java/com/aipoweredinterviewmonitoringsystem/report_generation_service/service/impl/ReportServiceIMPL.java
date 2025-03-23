package com.aipoweredinterviewmonitoringsystem.report_generation_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.repository.ReportRepository;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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


}
