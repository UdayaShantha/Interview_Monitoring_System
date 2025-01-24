package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
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
public interface QuestionSERepository extends JpaRepository<QuestionSE, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM QuestionSE se WHERE se.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("SELECT se.content,se.category,se.duration,se.keywords FROM QuestionSE se WHERE se.questionId = :questionId")
    Object getQuestionSEByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("UPDATE QuestionSE se SET se.content= :content, se.category= :category, se.duration= :duration, se.keywords= :keywords WHERE se.questionId= :questionId")
    Object updateQuestionSE(String content, QuestionType category, long duration, List<String> keywords, long questionId);

    @Modifying
    @Transactional
    @Query("SELECT se.content,se.category,se.duration FROM QuestionSE se WHERE se.questionId = :questionId")
    Object getQuestionSESPaiginated(long questionId);

    boolean existsByCategory(QuestionType category);

    @Modifying
    @Transactional
    @Query("SELECT se.content,se.category,se.duration FROM QuestionSE se WHERE se.questionId = :questionId AND se.category= :category")
    Object getCommonQuestionsPaiginatedByCategory(long questionId, QuestionType category);

    boolean existsByDuration(long duration);

    @Modifying
    @Transactional
    @Query("SELECT se.content,se.category,se.duration FROM QuestionSE se WHERE se.questionId = :questionId AND se.duration= :duration")
    Object getCommonQuestionsPaiginatedByDuration(long questionId, long duration);

    @Modifying
    @Transactional
    @Query("SELECT se.content,se.category,se.duration FROM QuestionSE se WHERE se.questionId = :questionId AND se.duration= :duration AND se.category= :category")
    Object getCommonQuestionsPaiginatedByDurationAndCategory(long questionId, long duration, QuestionType category);
}