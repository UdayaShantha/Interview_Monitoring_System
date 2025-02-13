package com.aipoweredinterviewmonitoringsystem.user_management_service.dto.response;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PositionResponse {
    private PositionType position;
}
