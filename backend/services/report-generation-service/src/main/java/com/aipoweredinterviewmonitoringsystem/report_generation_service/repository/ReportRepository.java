package com.aipoweredinterviewmonitoringsystem.report_generation_service.repository;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
}