package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto;

public class MetricValue {
    private String Metric;
    private String Value;

    public MetricValue(String metric, String value) {
        Metric = metric;
        Value = value;
    }

    public String getMetric() {
        return Metric;
    }

    public void setMetric(String metric) {
        Metric = metric;
    }

    public String getValue() {
        return Value;
    }

    public void setValue(String value) {
        Value = value;
    }

}
