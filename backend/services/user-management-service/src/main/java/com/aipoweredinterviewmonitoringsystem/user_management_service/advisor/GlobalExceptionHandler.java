package com.aipoweredinterviewmonitoringsystem.user_management_service.advisor;

import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<StandardResponse> handleUserNotFoundException(UserNotFoundException ex) {
        return new ResponseEntity<>(new StandardResponse(404, "User Not Found", ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CandidateNotFoundException.class)
    public ResponseEntity<StandardResponse> handleCandidateNotFoundException(CandidateNotFoundException ex) {
        return new ResponseEntity<>(new StandardResponse(404, "Candidate Not Found", ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardResponse> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(new StandardResponse(500, "Internal Server Error", ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
