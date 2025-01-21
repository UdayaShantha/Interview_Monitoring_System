package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.paiginated.QuestionPaiginatedDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.GetQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.SaveQuestionDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionDA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import com.aipoweredinterviewmonitoringsystem.question_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("api/v1/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/save")
    public ResponseEntity<StandardResponse> saveQuestion(@RequestBody SaveQuestionDTO saveQuestionDTO) {
        try {
            String savedQuestion = questionService.saveQuestion(saveQuestionDTO);
            return new ResponseEntity<>(
                    new StandardResponse(201, "Question Saved", savedQuestion), HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new StandardResponse(500, "Internal Server Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR
            );
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

    @GetMapping(path={"/get/questions/paiginated"},params = {"date","page","size"})
    public ResponseEntity<StandardResponse> getQuestionsPaiginated(@RequestParam(value = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
                                                                   @RequestParam(value = "page", defaultValue = "0") int page,
                                                                   @RequestParam(value="size", defaultValue = "6") int size)
    {
        QuestionPaiginatedDTO questionPaiginatedDTO=questionService.getQuestionsPaiginated(date,page,size);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",questionPaiginatedDTO),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(204,"No Content",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping("/count/common-question")
    public long getCommonQuestionCount() {
        return questionService.getCommonQuestionCount();
    }

    @GetMapping("/count/questionDA")
    public long getQuestionDACount() {
        return questionService.getQuestionDACount();
    }

    @GetMapping("/count/questionQA")
    public long getQuestionQACount() {
        return questionService.getQuestionQACount();
    }

    @GetMapping("/count/questionSE")
    public long getQuestionSECount() {
        return questionService.getQuestionSECount();
    }

    @GetMapping("/count/all-question")
    public long getAllQuestionCount() {
        return questionService.getAllQuestionCount();
    }

    @GetMapping(path={"/filter/questions/paiginated"},params = {"date","category","duration","page","size"})
    public ResponseEntity<StandardResponse> getFilteredQuestionsPaiginated(@RequestParam(value = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
                                                                           @RequestParam(value = "category")QuestionType category,
                                                                           @RequestParam(value="duration")long duration,
                                                                           @RequestParam(value = "page", defaultValue = "0") int page,
                                                                           @RequestParam(value="size", defaultValue = "6") int size)
    {
        QuestionPaiginatedDTO questionPaiginatedDTO=questionService.getFilteredQuestionsPaiginated(date,category,duration,page,size);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",questionPaiginatedDTO),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(204,"No Content",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }
}

