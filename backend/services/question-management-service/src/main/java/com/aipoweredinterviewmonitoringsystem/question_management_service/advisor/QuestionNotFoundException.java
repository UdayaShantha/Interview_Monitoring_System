package com.aipoweredinterviewmonitoringsystem.question_management_service.advisor;

public class QuestionNotFoundException extends RuntimeException {
    public QuestionNotFoundException(String message) {
        super(message);
    }
}
