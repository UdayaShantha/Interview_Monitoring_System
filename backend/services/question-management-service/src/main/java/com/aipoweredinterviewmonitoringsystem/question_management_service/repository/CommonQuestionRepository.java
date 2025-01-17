package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;


@Repository
@EnableJpaRepositories
public interface CommonQuestionRepository extends JpaRepository<CommonQuestion,Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM CommonQuestion c WHERE c.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);
}