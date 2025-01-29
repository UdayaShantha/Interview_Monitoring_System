package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.question_management_service.advisor.QuestionNotFoundException;
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
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @DeleteMapping(path = {"/question/remove"}, params = {"questionId"})
    public ResponseEntity<StandardResponse> deleteQuestion(@RequestParam(value = "questionId") long questionId) {
        try {
            String message = questionService.deleteQuestion(questionId);
            return new ResponseEntity<>(new StandardResponse(204, "Deleted", message), HttpStatus.OK);
        } catch (QuestionNotFoundException e) {
            return new ResponseEntity<>(new StandardResponse(404, "Question Not Found", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(new StandardResponse(500, "Internal Server Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(path = {"/get/question"}, params = {"questionId"})
    public ResponseEntity<StandardResponse> getQuestion(@RequestParam(value = "questionId") long questionId) {
        try {
            GetQuestionDTO getQuestionDTO = questionService.getQuestion(questionId);
            if (getQuestionDTO == null) {
                throw new QuestionNotFoundException("Question Not Found");
            }
            return new ResponseEntity<>(new StandardResponse(200, "Success", getQuestionDTO), HttpStatus.OK);
        } catch (QuestionNotFoundException e) {
            return new ResponseEntity<>(new StandardResponse(404, "Question Not Found", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(new StandardResponse(500, "Internal Server Error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(path = {"/update/question"},params = {"questionId"})
    public ResponseEntity<StandardResponse> updateQuestion(@RequestBody GetQuestionDTO getQuestionDTO,@RequestParam(value = "questionId") long questionId) {
        try {
            UpdateResponseDTO updateResponseDTO=questionService.updateQuestion(getQuestionDTO,questionId);
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
    public ResponseEntity<StandardResponse> getQuestionsPaiginated(@RequestParam(value = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                                   @RequestParam(value = "page", defaultValue = "0") int page,
                                                                   @RequestParam(value="size", defaultValue = "6") int size)
    {
        try {
            QuestionPaiginatedDTO questionPaiginatedDTO=questionService.getQuestionsPaiginated(date,page,size);
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

    @GetMapping(path={"/filter/questions/paiginated"},params = {"duration","page","size"})
    public ResponseEntity<StandardResponse> getFilteredQuestionsPaiginated(@RequestParam(value = "date" , required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                                           @RequestParam(value = "category" , required = false) QuestionType category,
                                                                           @RequestParam(value="duration" , defaultValue = "0")long duration,
                                                                           @RequestParam(value = "page", defaultValue = "0") int page,
                                                                           @RequestParam(value="size", defaultValue = "6") int size)
    {

        try {
            QuestionPaiginatedDTO questionPaiginatedDTO=questionService.getFilteredQuestionsPaiginated(date,category,duration,page,size);
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

