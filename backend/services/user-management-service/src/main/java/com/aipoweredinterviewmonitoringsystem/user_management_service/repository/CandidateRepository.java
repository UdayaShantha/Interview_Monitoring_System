package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.PositionType;
import feign.Param;
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


    @Query("SELECT c FROM Candidate c WHERE c.positionType = :positionType")
    List<Candidate> findByPositionType(@Param("positionType") PositionType positionType);


   // List<Candidate> findByPositionType(PositionType positionType);




    @Modifying
    @Transactional
    @Query("SELECT c.positionType FROM Candidate c WHERE c.userId = :userId")
    Candidate findPositionByuserId(long userId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Candidate (rate,comment) VALUES (:rate, :comment)", nativeQuery = true)
    void saveRateAndComment(int rate, String comment);

}
