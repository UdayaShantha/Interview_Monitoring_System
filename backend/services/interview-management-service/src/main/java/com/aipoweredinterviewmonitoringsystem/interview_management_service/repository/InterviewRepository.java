package com.aipoweredinterviewmonitoringsystem.interview_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import jakarta.transaction.Transactional;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@EnableJpaRepositories
@Repository
@Transactional


public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findAllByStatusEquals(Status status);

    Interview findByCandidateId(Long candidateId);

    boolean existsByCandidateId(Long candidateId);

    Page<Interview> findAll(Pageable pageable);

    Object getCandidateByInterviewId(long id);

    List<Interview> findAllByResultEquals(Result result);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.status = :status")
    long countByStatus(@Param("status") Status status);

    @Query("SELECT i FROM Interview i WHERE i.scheduleDate = :today")
    List<Interview> findAllByScheduleDateEquals(@Param("today") LocalDate today);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.scheduleDate = CURRENT_DATE")
    long countTotalInterviewsToday();

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.scheduleDate = CURRENT_DATE AND i.startTime > CURRENT_TIME ")
    long countUnfinishedInterviewsToday();

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.status = :status AND i.scheduleDate = :date")
    long countByStatusAndDate(Status status, LocalDate date);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.scheduleDate = :today")
    long countByDate(LocalDate today);

    @Query("SELECT DISTINCT'*' FROM  Candidate c WHERE c.userId= :candidateId")
    Candidate findCandidateByCandidateId(long candidateID);
}
