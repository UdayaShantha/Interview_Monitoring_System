package com.aipoweredinterviewmonitoringsystem.interview_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
@EnableJpaRepositories
@Repository
@Transactional
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findAllByStatusEquals(String status);

    Interview findByCandidateId(Long candidateId);

    boolean existsByCandidateId(Long candidateId);

    Page<Interview> findAll(Pageable pageable);

    Object getCandidateByInterviewId(long id);
}
