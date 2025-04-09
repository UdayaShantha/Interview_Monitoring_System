package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResultCountDTO {
    private Result result;
    private long count;
}
