package com.aipoweredinterviewmonitoringsystem.user_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.user_management_service.advisor.UserNotFoundException;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateSaveDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateAndInterviewDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated.PaginatedCandidateGetAllDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.CandidatePhotoResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response.PositionResponse;
import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.*;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import com.aipoweredinterviewmonitoringsystem.user_management_service.util.StandardResponse;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/hr/candidate/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StandardResponse> saveCandidate(
            @RequestPart("candidate") @Valid String candidateJson,
            @RequestPart("photos") List<MultipartFile> photos) {
        try {
            if (photos == null || photos.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new StandardResponse(400, "At least one photo is required", null));
            }

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);

            CandidateSaveDTO candidateSaveDTO = objectMapper.readValue(candidateJson, CandidateSaveDTO.class);

            // Additional validation
            if (candidateSaveDTO.getPositionType() == null) {
                return ResponseEntity.badRequest()
                        .body(new StandardResponse(400, "Position type is required", null));
            }

            CandidatePhotoSaveDTO candidatePhotoSaveDTO = new CandidatePhotoSaveDTO();
            candidatePhotoSaveDTO.setPhotos(photos);
            CandidateSaveDTO savedCandidate = userService.saveCandidate(candidateSaveDTO, candidatePhotoSaveDTO);
            return new ResponseEntity<>(new StandardResponse(201, "Success", savedCandidate), HttpStatus.CREATED);
        } catch (JsonParseException e) {
        return ResponseEntity.badRequest()
                .body(new StandardResponse(400, "Invalid JSON format", null));
    } catch (JsonMappingException e) {
        return ResponseEntity.badRequest()
                .body(new StandardResponse(400, "Field mismatch: " + e.getMessage(), null));
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .body(new StandardResponse(500, "Error: " + e.getMessage(), null));
    }

    }

    @GetMapping("/hr/candidate-interview/{id}")
    public ResponseEntity<StandardResponse> getCandidateAndInterviewById(@PathVariable(value = "id") Long userId) {
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

    @GetMapping ("/hr/candidate/all/")
    public ResponseEntity<StandardResponse> getAllCandidates() {
        List<AllCandidatesDTO> allCandidates = userService.getAllCandidates();
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",allCandidates),
                HttpStatus.FOUND
        );
    }

    @GetMapping(
            path = "/hr/candidate/all/paginated",
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


    @DeleteMapping("/hr/candidate/{id}")
    public ResponseEntity<StandardResponse> deleteCandidate(@PathVariable(value = "id") Long userId) {
        String message = userService.deleteCandidate(userId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200,"Success",message),
                HttpStatus.OK
        );
    }

    @PutMapping("/hr/candidate/{id}")
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
        try {
            String msg=userService.saveCandidateFeedback(user_id,rate,comment);
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

    @GetMapping("/hr/candidate/position/{id}")
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

    @GetMapping("/hr/get/candidate/photos")
    public ResponseEntity<StandardResponse> getCandidatePhotosById(@RequestParam long userId) {
        try {
            CandidatePhotoResponse photoDTO = userService.getCandidatePhotosById(userId);
            return new ResponseEntity<>(
                    new StandardResponse(200, "Success", photoDTO),
                    HttpStatus.OK
            );
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(
                    new StandardResponse(404, "User Not Found", e.getMessage()),
                    HttpStatus.NOT_FOUND
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new StandardResponse(500, "Internal Server Error", e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    //Get User details to generate pdf
    @GetMapping("/get/user-Details-by-userId")
    public ResponseEntity<StandardResponse> getUserDetailsByUserId(@RequestParam long userId) {
        try {
            CandidateUpdateDTO userDetailsDTO = userService.getUserDetailsByUserId(userId);
            return new ResponseEntity<>(
                    new StandardResponse(200, "Success", userDetailsDTO),
                    HttpStatus.OK
            );
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(
                    new StandardResponse(404, "User Not Found", e.getMessage()),
                    HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("hr/hr/save")
    public ResponseEntity<StandardResponse> saveHr(@RequestBody HrSaveDTO hrSaveDTO){
        try {
            String savedHr = userService.saveHr(hrSaveDTO);
            return new ResponseEntity<>(
                    new StandardResponse(201, "HR Saved", savedHr),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new StandardResponse(500, "Internal Server Error", e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @PostMapping("technical/technical/save")
    public ResponseEntity<StandardResponse> saveTechnical(@RequestBody TechnicalSaveDTO technicalSaveDTO){
        try {
            String savedTechnical = userService.saveTechnical(technicalSaveDTO);
            return new ResponseEntity<>(
                    new StandardResponse(201, "Technical Saved", savedTechnical),
                    HttpStatus.CREATED

            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new StandardResponse(500, "Internal Server Error", e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}