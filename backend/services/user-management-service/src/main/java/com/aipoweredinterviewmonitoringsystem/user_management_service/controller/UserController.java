package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.xml.stream.events.Comment;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/v1/users")
public class UserController {
    @Autowired
    private UserService userService;

//    @PostMapping("/candidate")
//    public ResponseEntity<Candidate> saveCandidate(@RequestBody CandidateDTO candidateDTO) {
//        try {
//            Candidate savedCandidate = userService.saveCandidate(candidateDTO);
//            return new ResponseEntity<>(savedCandidate, HttpStatus.CREATED);
//        } catch (Exception e) {
//            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    @PostMapping("/candidate")
    public ResponseEntity<StandardResponse> saveCandidate(@RequestBody CandidateSaveDTO candidateSaveDTO) {
        CandidateSaveDTO savedCandidate = userService.saveCandidate(candidateSaveDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(201,"Success",savedCandidate),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/candidate/{id}")
    public ResponseEntity<StandardResponse> getCandidateById(@PathVariable(value = "id") Long userId) {
        CandidateDTO candidateDTO = userService.getCandidateById(userId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",candidateDTO),
                HttpStatus.OK
        );
    }

    @GetMapping("/candidate/all")
    public ResponseEntity<StandardResponse> getAllCandidates() {
        List<CandidateDTO> allCandidates = userService.getAllCandidates();
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allCandidates),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/candidate/{id}")
    public ResponseEntity<StandardResponse> deleteCandidate(@PathVariable(value = "id") Long userId) {
        String message = userService.deleteCandidate(userId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",message),
                HttpStatus.OK
        );
    }

    @PutMapping("candidate/{id}")
    public ResponseEntity<StandardResponse> updateCandidate(@PathVariable(value = "id") Long userId, @RequestBody CandidateDTO candidateDTO) {
        CandidateDTO candidateUpdateDTO = userService.updateCandidate(userId,candidateDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",candidateUpdateDTO),
                HttpStatus.OK
        );
    }

    @PostMapping(path={"hr/technical/comment"},params={"user_id","comment"})
    public ResponseEntity<StandardResponse> saveComment(@RequestParam(value = "user_id") long user_id,
                                                        @RequestParam(value="comment") String comment ){
        String msg=userService.saveComment(user_id,comment);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(201,"Success",msg),HttpStatus.OK
        );
    }

    @GetMapping(path={"/hr/technical/name"},params = {"useId"})
    public ResponseEntity<StandardResponse> getName(@RequestParam(value = "useId") long userId) {
        String name=userService.getName(userId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",name),HttpStatus.OK
        );
    }









}
