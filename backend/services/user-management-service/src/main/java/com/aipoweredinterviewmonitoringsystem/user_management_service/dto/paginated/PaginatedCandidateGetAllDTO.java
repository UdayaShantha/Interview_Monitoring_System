package com.aipoweredinterviewmonitoringsystem.user_management_service.dto.paginated;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.AllCandidatesDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaginatedCandidateGetAllDTO {
    List<AllCandidatesDTO> list;
    private Long totalCandidates;
}
