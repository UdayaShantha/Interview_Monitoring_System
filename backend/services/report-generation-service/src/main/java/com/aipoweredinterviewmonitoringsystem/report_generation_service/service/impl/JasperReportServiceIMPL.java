package com.aipoweredinterviewmonitoringsystem.report_generation_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.JasperReportService;
import jakarta.annotation.PostConstruct;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
public class JasperReportServiceIMPL implements JasperReportService {

    private static final String REPORT_TEMPLATE = "template/final_report.jrxml";
    private JasperReport compiledReport;

    @PostConstruct
    public void init() throws JRException, IOException {
        try (InputStream reportStream = new ClassPathResource(REPORT_TEMPLATE).getInputStream()) {
            this.compiledReport = JasperCompileManager.compileReport(reportStream);
        }catch (Exception e){
            throw new JRException("Error generating Jasper report: " + e.getMessage(), e);
        }
    }

//    @Override
//    public byte[] generateReport(Map<String, Object> parameters) throws JRException {
//        try {
//            // Load the JRXML file from resources
//            InputStream reportStream = new ClassPathResource(REPORT_TEMPLATE).getInputStream();
//
//            // Compile the Jasper report
//            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
//
//            // Fill the report with data
//            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, new JREmptyDataSource());
//
//            // Convert the report to a byte array
//            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
//            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
//
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new JRException("Error generating Jasper report: " + e.getMessage(), e);
//        }
//    }

    @Override
    public byte[] generateReport(Map<String, Object> parameters) throws JRException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(
                    compiledReport,
                    parameters,
                    new JREmptyDataSource()
            );

            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new JRException("Error generating report", e);
        }
    }
}
