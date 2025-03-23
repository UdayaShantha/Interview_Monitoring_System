package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto;

public class ReportDownloadDTO {
    private String candidateName;
    private byte[] pdfContent;

    public ReportDownloadDTO(String candidateName, byte[] pdfContent) {
        this.candidateName = candidateName;
        this.pdfContent = pdfContent;
    }

    public ReportDownloadDTO() {
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public byte[] getPdfContent() {
        return pdfContent;
    }

    public void setPdfContent(byte[] pdfContent) {
        this.pdfContent = pdfContent;
    }

}
