package com.aipoweredinterviewmonitoringsystem.report_generation_service.repository;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Object> findByCandidateId(Long candidateId);
}