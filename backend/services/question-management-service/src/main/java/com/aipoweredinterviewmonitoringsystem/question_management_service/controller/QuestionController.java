package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionDA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import com.aipoweredinterviewmonitoringsystem.question_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("api/v1/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    //----------------Save the Questions----------------
    @PostMapping("/save")
    public String saveQuestion(@RequestBody SaveQuestionDTO saveQuestionDTO) {
        try {
            String savedQuestion = questionService.saveQuestion(saveQuestionDTO);
            return savedQuestion;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }


    @DeleteMapping(path = {"/question/remove"},params = {"questionId"})
    public ResponseEntity<StandardResponse> deleteQuestion(@RequestParam(value = "questionId") long questionId) {
        String message = questionService.deleteQuestion(questionId);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(204,"Deleted",message),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"Question Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping(path = {"/get/question"},params = {"questionId"})
    public ResponseEntity<StandardResponse> getQuestion(@RequestParam(value = "questionId") long questionId) {
        GetQuestionDTO getQuestionDTO=questionService.getQuestion(questionId);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",getQuestionDTO),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"Question Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @PutMapping(path = {"/update/question"},params = {"questionId"})
    public ResponseEntity<StandardResponse> updateQuestion(@RequestBody GetQuestionDTO getQuestionDTO,@RequestParam(value = "questionId") long questionId) {
        UpdateResponseDTO updateResponseDTO=questionService.updateQuestion(getQuestionDTO,questionId);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",updateResponseDTO),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(204,"No Content",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }
}

