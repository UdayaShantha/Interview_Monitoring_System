package com.aipoweredinterviewmonitoringsystem.interview_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findAllByStatusEquals(String status);
}
