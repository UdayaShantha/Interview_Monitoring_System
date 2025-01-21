package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import jakarta.transaction.Transactional;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableJpaRepositories
@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    @Modifying
    @Transactional
    @Query("SELECT c.name FROM Candidate c WHERE c.userId = :userId")
    String findNameByUserId(long userId);

    @Modifying
    @Transactional
    @Query("SELECT c.positionType FROM Candidate c WHERE c.userId = :userId")
    Candidate findPositionByuserId(long userId);
}
