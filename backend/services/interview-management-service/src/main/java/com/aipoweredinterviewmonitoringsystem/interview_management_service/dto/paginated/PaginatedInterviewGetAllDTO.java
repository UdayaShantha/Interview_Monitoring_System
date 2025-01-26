package com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.paginated;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.dto.GetAllInterviewsDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaginatedInterviewGetAllDTO {
    private List<GetAllInterviewsDTO> list;
    private Long totalInterviews;
}
