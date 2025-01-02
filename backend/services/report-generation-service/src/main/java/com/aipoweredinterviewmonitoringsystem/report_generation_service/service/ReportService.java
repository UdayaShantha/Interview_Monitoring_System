package com.aipoweredinterviewmonitoringsystem.report_generation_service.service;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;


@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    public Report updateReport(Long id, Report updatedReport) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        report.setEmotionAnalysis(updatedReport.getEmotionAnalysis());
        report.setSpeechAnalysis(updatedReport.getSpeechAnalysis());
        report.setFaceVerification(updatedReport.getFaceVerification());
        report.setScore(updatedReport.getScore());
        return reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        reportRepository.delete(report);
    }

    public ByteArrayInputStream generateReportFile(Long id) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));

        // Example: Generating a CSV file (modify for other formats)
        String csvContent = "ID,Emotion Analysis,Speech Analysis,Face Verification,Score\n" +
                report.getId() + "," +
                report.getEmotionAnalysis() + "," +
                report.getSpeechAnalysis() + "," +
                report.getFaceVerification() + "," +
                report.getScore() + "\n";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write(csvContent.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("Error generating report file", e);
        }

        return new ByteArrayInputStream(outputStream.toByteArray());
    }


    }









