package com.aipoweredinterviewmonitoringsystem.user_management_service.dto;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CandidateFeedbackDTO {
    private String name;
    private PositionType positionType;
    private Integer rate;
    private String comment;

}
