package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.auth.AuthRequest;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated.PaginatedCandidateGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.CandidateRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.JwtService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("api/v1/users")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private AuthenticationManager authenticationManager;


    @PostMapping("/token")
    public String getToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        ;
        if (authentication.isAuthenticated()) {
            return userService.generateToken(authRequest.getUsername());
        }else {
            throw new RuntimeException("Invalid username or password");
        }

    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam(value = "token") String token) {
        userService.validateToken(token);
        return "Token is valid";
    }

    @PostMapping("/candidate/save")
    public ResponseEntity<StandardResponse> saveCandidate(@RequestBody CandidateSaveDTO candidateSaveDTO) {
        try {
            CandidateSaveDTO savedCandidate = userService.saveCandidate(candidateSaveDTO);
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(201,"Success",savedCandidate),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(500,"Internal Server Error",e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/candidate-interview/{id}")
    public ResponseEntity<StandardResponse> getCandidateAndInterviewById(@PathVariable(value = "id") Long userId,@RequestHeader(value = "loggedInUser") String username) {
        System.out.println("loggedInUser : "+username);
        try {
            CandidateAndInterviewDTO candidateAndInterviewDTO = userService.getCandidateAndInterviewById(userId);
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200, "Success", candidateAndInterviewDTO),
                    HttpStatus.FOUND
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404, "Candidate Not Found", e.getMessage()),
                    HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(500, "Internal Server Error", e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping ("/candidate/all/")
    public ResponseEntity<StandardResponse> getAllCandidates() {
        List<AllCandidatesDTO> allCandidates = userService.getAllCandidates();
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allCandidates),
                HttpStatus.OK
        );
    }

    @GetMapping(
            path = "/candidate/all/paginated",
            params = {"page", "size"}
    )
    public ResponseEntity<StandardResponse> getAllCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedCandidateGetAllDTO paginatedCandidateGetAllDTO = userService.getAllCandidatesPaginated(page, size);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "Success", paginatedCandidateGetAllDTO),
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
    public ResponseEntity<StandardResponse> updateCandidate(@PathVariable(value = "id") Long userId, @RequestBody CandidateUpdateDTO candidateUpdateDTO) {
        CandidateUpdateDTO updatedCandidate = userService.updateCandidate(userId, candidateUpdateDTO);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",candidateUpdateDTO),
                HttpStatus.OK
        );
    }

    @PostMapping(path={"/hr/technical/comment"},params={"user_id","comment"})
    public ResponseEntity<StandardResponse> saveComment(@RequestParam(value = "user_id") long user_id,
                                                        @RequestParam(value="comment") String comment ){
        String msg=userService.saveComment(user_id,comment);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",msg),HttpStatus.CREATED
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping(path={"/hr/technical/name"},params = {"userId"})
    public ResponseEntity<StandardResponse> getUserName(@RequestParam(value = "userId") long userId) {

        String name=userService.getUserName(userId);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",name),HttpStatus.FOUND
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping(path={"/candidate/position"},params={"user_id"})
    public ResponseEntity<StandardResponse> getCandidatePosition(@RequestParam(value = "user_id") long user_id){
        PositionResponse positionResponse =userService.getCandidatePosition(user_id);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",positionResponse),HttpStatus.FOUND
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }
    @PostMapping(path={"/candidate/feedback"},params={"user_id","rate","comment"})
    public ResponseEntity<StandardResponse> saveCandidateFeedback(@RequestParam(value = "user_id") long user_id,
                                                        @RequestParam(value = "rate") int rate,
                                                        @RequestParam(value="comment") String comment){
        String msg=userService.saveCandidateFeedback(user_id,rate,comment);
        try {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",msg),HttpStatus.CREATED
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }

    @GetMapping("/candidate/position/{id}")
    public ResponseEntity<StandardResponse> getCandidatePositionById(@PathVariable(value = "id") Long userId){
        try {
            String position = userService.getCandidatePositionById(userId);
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(200,"Success",position),HttpStatus.OK
            );
        }
        catch (Exception e) {
            return new ResponseEntity<StandardResponse>(
                    new StandardResponse(404,"User Not Found",e.getMessage()),HttpStatus.NOT_FOUND
            );
        }
    }
}
