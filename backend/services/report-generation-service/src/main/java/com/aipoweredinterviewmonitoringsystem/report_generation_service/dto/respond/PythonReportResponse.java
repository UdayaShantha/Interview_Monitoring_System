package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.MetricValue;

import java.util.List;

public class PythonReportResponse {
    private String status;
    private List<MetricValue> data;

    public PythonReportResponse(String status, List<MetricValue> data) {
        this.status = status;
        this.data = data;
    }

    public PythonReportResponse() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<MetricValue> getData() {
        return data;
    }

    public void setData(List<MetricValue> data) {
        this.data = data;
    }
}
