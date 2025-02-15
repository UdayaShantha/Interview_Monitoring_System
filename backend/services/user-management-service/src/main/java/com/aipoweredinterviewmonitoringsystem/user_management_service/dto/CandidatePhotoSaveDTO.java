package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CandidatePhotoSaveDTO {
    private List<MultipartFile> photos;
}
