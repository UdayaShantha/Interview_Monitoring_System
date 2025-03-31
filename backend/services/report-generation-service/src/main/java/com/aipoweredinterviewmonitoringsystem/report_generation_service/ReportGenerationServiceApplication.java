package com.aipoweredinterviewmonitoringsystem.report_generation_service;

import net.sf.jasperreports.engine.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication

public class ReportGenerationServiceApplication {

	public static void main(String[] args) throws JRException {
		SpringApplication.run(ReportGenerationServiceApplication.class, args);
//		String filePath = "D:\\projects\\Final year project\\Interview_Monitoring_System\\backend\\services\\report-generation-service\\src\\main\\resources\\template\\final_report.jrxml";
//		Map<String, Object> parameters = new HashMap<>();
//		parameters.put("Name", "John Doe");
//		parameters.put("NIC", "2001423617V");
//		parameters.put("Position", "Software Engineer");
//		parameters.put("Email", "abcd@gmail.com");
//		parameters.put("Contact_Number", "0712345678");
//		parameters.put("Interview_id", 22);
//		parameters.put("Date", "2021-09-20");
//		parameters.put("Duration", "30 minutes");

//		JasperReport jasperReport = JasperCompileManager.compileReport(filePath);
//		JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport , parameters, new JREmptyDataSource());
//		JasperExportManager.exportReportToPdfFile(jasperPrint, "G:\\downloads_2\\final_report.pdf");
//		System.out.println("PDF Generate Successfully");

//		try {
//			JasperReport jasperReport = JasperCompileManager.compileReport(filePath);
//
//			// Use a streaming approach to handle large reports
//			JRDataSource dataSource = new JREmptyDataSource();
//			JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
//
//			// Use output stream instead of generating large files in memory
//			File outputFile = new File("G:\\downloads_2\\final_report.pdf");
//			try (OutputStream outputStream = new FileOutputStream(outputFile)) {
//				JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
//			}
//			System.out.println("PDF Generated Successfully");
//
//		} catch (OutOfMemoryError e) {
//			System.err.println("Error: Report generation failed due to insufficient memory.");
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
	}
}
