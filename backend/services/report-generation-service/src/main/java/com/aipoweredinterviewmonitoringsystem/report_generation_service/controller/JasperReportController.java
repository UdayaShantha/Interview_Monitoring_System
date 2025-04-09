package com.aipoweredinterviewmonitoringsystem.report_generation_service.controller;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.client.InterviewServiceClient;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.client.UserServiceClient;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.AnswerAccuracyDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.EmotionData;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.ReportDownloadDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.request.CandidateDetailsDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.request.GetInterviewDetailsDTO;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.AccuracyData;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.AccuracyRequest;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.respond.InterviewMetricsDto;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.JasperReportService;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.service.ReportService;
import com.aipoweredinterviewmonitoringsystem.report_generation_service.util.StandardResponse;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/reports")
public class JasperReportController {

    private final JasperReportService jasperReportService;

    private final ReportService reportService;

    private final InterviewServiceClient interviewServiceClient;
    private final UserServiceClient userServiceClient;

    @Autowired
    public JasperReportController(JasperReportService jasperReportService, ReportService reportService, InterviewServiceClient interviewServiceClient, UserServiceClient userServiceClient) {
        this.jasperReportService = jasperReportService;
        this.reportService = reportService;
        this.interviewServiceClient = interviewServiceClient;
        this.userServiceClient = userServiceClient;
    }

    @PostMapping(path = "/generate" )
    public ResponseEntity<StandardResponse> generateReport(
            @RequestBody AccuracyRequest getAccuracyRequestDTO
            ) {
        try {
            Long interviewId = getAccuracyRequestDTO.getInterviewId();
            System.out.println("Interview ID: " + interviewId);
            System.out.println("Data ; " + getAccuracyRequestDTO.getConfident());

            // Fetch json from Python service
//            InterviewMetricsDto metrics = reportService.fetchMetricsFromPythonService(interviewId);
//            System.out.println("Metrics from Python service: " + metrics);

            // Get interview details from interview management service
            ResponseEntity<StandardResponse> interviewDetails = interviewServiceClient
                    .getInterviewDetailsByInterviewId(interviewId);

            if(!interviewDetails.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Interview service error: " +
                        interviewDetails.getStatusCode());
            }

            Object interviewData = interviewDetails.getBody().getData();

            Map<String, Object> mapInterviewData = (Map<String, Object>) interviewData;

            GetInterviewDetailsDTO interviewDetailsDTO = new GetInterviewDetailsDTO();

            //Add to the interviewDetailsDTO
            interviewDetailsDTO.setCandidateId(((Number) mapInterviewData.get("candidateId")).longValue());
            interviewDetailsDTO.setScheduleDate(LocalDate.parse((String) mapInterviewData.get("scheduleDate")));
            interviewDetailsDTO.setDuration((Double) mapInterviewData.get("duration"));

            System.out.println("User Id : " + interviewDetailsDTO.getCandidateId());

            //Get user details from user management service
            ResponseEntity<StandardResponse> userDetails = userServiceClient.
                    getUserDetailsByUserId(interviewDetailsDTO.getCandidateId());

            if (!userDetails.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("User service error: " +
                        userDetails.getStatusCode());
            }

            Object userData = userDetails.getBody().getData();

            Map<String, Object> mapData = (Map<String, Object>) userData;

            CandidateDetailsDTO candidateDetailsDTO = new CandidateDetailsDTO();

            //Add data to the candidateDetailsDTO
            candidateDetailsDTO.setUsername((String) mapData.get("username"));
            candidateDetailsDTO.setPassword((String) mapData.get("password"));
            candidateDetailsDTO.setName((String) mapData.get("name"));
            candidateDetailsDTO.setNic((String) mapData.get("nic"));
            candidateDetailsDTO.setEmail((String) mapData.get("email"));
            candidateDetailsDTO.setAddress((String) mapData.get("address"));
            candidateDetailsDTO.setPhone((String) mapData.get("phone"));
            candidateDetailsDTO.setBirthday(LocalDate.parse((String) mapData.get("birthday")));
            //candidateDetailsDTO.setPositionType(PositionType.valueOf((String) mapData.get("positionType")));
            if(mapData.get("positionType").equals("SOFTWARE_ENGINEER")){
                candidateDetailsDTO.setPositionType("Software Engineering");
            }else if(mapData.get("positionType").equals("QA")) {
                candidateDetailsDTO.setPositionType("Quality Assurance");
            }else if(mapData.get("positionType").equals("DATA_ANALYTICS")) {
                candidateDetailsDTO.setPositionType("Data Analytics");
            }else{
                candidateDetailsDTO.setPositionType(null);
            }

            System.out.println("Username :" + candidateDetailsDTO.getUsername());

            //--------------------------------------------------------------------------------

            //verification
//            String verification ;
//            if((metrics.getValidFaceDetections()/metrics.getAnalyzedFrames())*100 >= 40){
//                verification = "Identified";
//            }else{
//                verification = "Not Identified";
//            }


            //Add parameters to the report----------------------------------------------------

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("Name", candidateDetailsDTO.getName());
            parameters.put("NIC", candidateDetailsDTO.getNic());
            parameters.put("Position", candidateDetailsDTO.getPositionType());
            parameters.put("Email", candidateDetailsDTO.getEmail());
            parameters.put("Contact_number", candidateDetailsDTO.getPhone());
            parameters.put("Duration", String.valueOf(interviewDetailsDTO.getDuration()) + " Minutes");
            parameters.put("Verification", "Identified");
            parameters.put("Interview_id", interviewDetailsDTO.getCandidateId());
            parameters.put("Address", candidateDetailsDTO.getAddress());
            parameters.put("Date", String.valueOf(interviewDetailsDTO.getScheduleDate()));

            // Emotion Data
            List<EmotionData> emotionDataList = new ArrayList<>();
            emotionDataList.add(new EmotionData("Confident", getAccuracyRequestDTO.getConfident()));
            emotionDataList.add(new EmotionData("Neutral", getAccuracyRequestDTO.getNeutral()));
            emotionDataList.add(new EmotionData("Surprise", getAccuracyRequestDTO.getSurprise()));
            emotionDataList.add(new EmotionData("Fear", getAccuracyRequestDTO.getFear()));
            emotionDataList.add(new EmotionData("Others",getAccuracyRequestDTO.getOthers()));

            // Convert to JRBeanCollectionDataSource
            JRBeanCollectionDataSource emotionDataSource = new JRBeanCollectionDataSource(emotionDataList);
            parameters.put("emotionDataSet", emotionDataSource);

            //Answer Accuracy Data
            List<AnswerAccuracyDTO> answerAccuracyDataList = new ArrayList<>();
            for(AccuracyData data : getAccuracyRequestDTO.getAccuracyData()){
                answerAccuracyDataList.add(new AnswerAccuracyDTO(data.getQuestion_id(), (int) Math.round(data.getAccuracy())));
            }
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(1L, 70));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(2L, 80));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(3L, 90));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(4L, 75));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(5L, 55));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(6L, 85));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(7L, 35));
//            answerAccuracyDataList.add(new AnswerAccuracyDTO(8L, 65));

            // Convert to JRBeanCollectionDataSource
            JRBeanCollectionDataSource accuracyDataSource = new JRBeanCollectionDataSource(answerAccuracyDataList);
            parameters.put("answerDataSet", accuracyDataSource);

            byte[] pdfBytes = jasperReportService.generateReport(parameters);

            String saveReport = reportService.saveReport(interviewDetailsDTO.getCandidateId(), interviewId, candidateDetailsDTO.getName(), pdfBytes);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("report.pdf")
                            .build()
            );

//            return ResponseEntity.ok()
//                    .headers(headers)
//                    .body(pdfBytes);
            return ResponseEntity.ok().body(new StandardResponse(200, "Report generated successfully", saveReport));

        } catch (Exception e) {
            System.out.println("PDF not generate");
            return ResponseEntity.internalServerError().body(new StandardResponse(500, "Report generation failed", e.getMessage()));
//            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/download/{reportId}")
    public ResponseEntity<byte[]> downloadReportById(
            @RequestParam(value = "reportId") Long reportId
    ){
        try {
            ReportDownloadDTO reportDownloadDTO = reportService.getReportForDownload(reportId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename(reportDownloadDTO.getCandidateName()+"_report.pdf")
                            .build()
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportDownloadDTO.getPdfContent());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/view/{reportId}")
    public ResponseEntity<byte[]> viewReportById(
            @RequestParam(value = "reportId") Long reportId
    ){
        try {
            ReportDownloadDTO reportDownloadDTO = reportService.getReportForDownload(reportId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename(reportDownloadDTO.getCandidateName()+"_report.pdf")
                            .build()
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportDownloadDTO.getPdfContent());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}