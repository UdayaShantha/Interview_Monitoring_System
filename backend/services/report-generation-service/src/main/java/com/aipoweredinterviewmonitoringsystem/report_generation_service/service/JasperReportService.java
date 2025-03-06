package com.aipoweredinterviewmonitoringsystem.report_generation_service.service;

import net.sf.jasperreports.engine.JRException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public interface JasperReportService {

    byte[] generateReport(Map<String, Object> parameters) throws JRException, IOException;
}
