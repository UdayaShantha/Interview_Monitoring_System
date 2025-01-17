package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

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

    @DeleteMapping(path = {"question/remove"},params = {"questionId"})
    public ResponseEntity<StandardResponse> deleteQuestion(@RequestParam(value = "questionId") long questionId) {
        String message = questionService.deleteQuestion(questionId);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(204,"Deleted",message),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",message),HttpStatus.NOT_FOUND
            );
        }
    }
}

