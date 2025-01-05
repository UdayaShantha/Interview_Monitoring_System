package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionDS;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("api/v1/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/save")
    public <T> T saveQuestion(@RequestBody T questionEntity) {
        return questionService.saveQuestion(questionEntity);
    }

    @GetMapping("/{id}")
    public <T> Optional<T> getQuestionById(@PathVariable Long id, @RequestParam String type) {
        return (Optional<T>) questionService.findQuestionById(id, getClassType(type));
    }

    @PutMapping("/{id}")
    public <T> Object updateQuestionById(@PathVariable Long id, @RequestParam String type) {
        return questionService.updateQuestionById(id, getClassType(type));
    }

    @DeleteMapping("/{id}")
    public void deleteQuestionById(@PathVariable Long id, @RequestParam String type) {
        questionService.deleteQuestionById(id, getClassType(type));
    }

    private Class<?> getClassType(String type) {
        return switch (type.toLowerCase()) {
            case "common" -> CommonQuestion.class;
            case "ds" -> QuestionDS.class;
            case "qa" -> QuestionQA.class;
            case "se" -> QuestionSE.class;
            default -> throw new IllegalArgumentException("Invalid type");
        };
    }
}

