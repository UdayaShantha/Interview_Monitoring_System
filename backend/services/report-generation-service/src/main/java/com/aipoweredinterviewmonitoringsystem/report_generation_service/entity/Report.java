package com.aipoweredinterviewmonitoringsystem.report_generation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "report")
//@AllArgsConstructor
//@NoArgsConstructor
//@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "interview_id", nullable = false, unique = true)
    private Long interviewId;

    @Column(name = "candidate_id", nullable = false, unique = true)
    private Long candidateId;

    @Column(name = "candidate_name", nullable = false )
    private String candidateName;

    @Lob
    @Column(name = "pdf_file", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] pdfFile;

    @Column(name = "genarated_at", nullable = false)
    private LocalDate generatedAt;

    public Report(Long reportId, Long interviewId, Long candidateId, String candidateName, byte[] pdfFile, LocalDate generatedAt) {
        this.reportId = reportId;
        this.interviewId = interviewId;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.pdfFile = pdfFile;
        this.generatedAt = generatedAt;
    }

    public Report() {
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public byte[] getPdfFile() {
        return pdfFile;
    }

    public void setPdfFile(byte[] pdfFile) {
        this.pdfFile = pdfFile;
    }

    public LocalDate getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDate generatedAt) {
        this.generatedAt = generatedAt;
    }
}