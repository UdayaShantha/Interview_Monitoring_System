package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

@Repository
@EnableJpaRepositories
public interface QuestionQARepository extends JpaRepository<QuestionQA, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM QuestionQA qa WHERE qa.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);
}