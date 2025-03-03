package com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CandidatePhotoResponse {
    private List<byte[]> photos;
}
