package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionQA;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@EnableJpaRepositories
public interface QuestionQARepository extends JpaRepository<QuestionQA, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM QuestionQA qa WHERE qa.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("SELECT qa.content,qa.category,qa.duration,qa.keywords FROM QuestionQA qa WHERE qa.questionId = :questionId")
    Object getQuestionQAByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("UPDATE QuestionQA qa SET qa.content= :content, qa.category= :category, qa.duration= :duration, qa.keywords= :keywords WHERE qa.questionId= :questionId")
    Object updateQuestionQA(String content, QuestionType category, long duration, List<String> keywords, long questionId);

    @Modifying
    @Transactional
    @Query("SELECT qa.content,qa.category,qa.duration FROM QuestionQA qa WHERE qa.questionId = :questionId")
    Object getQuestionQASPaiginated(long questionId);
}