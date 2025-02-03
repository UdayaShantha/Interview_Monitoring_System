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
@Transactional
public interface QuestionQARepository extends JpaRepository<QuestionQA, Long> {
    @Modifying
    @Query("DELETE FROM QuestionQA qa WHERE qa.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Query("SELECT qa.content,qa.category,qa.duration,qa.keywords FROM QuestionQA qa WHERE qa.questionId = :questionId")
    Object getQuestionQAByQuestionId(long questionId);

    @Modifying
    @Query("UPDATE QuestionQA q SET q.content= :content, q.category= :category, q.duration= :duration, q.keywords= :keywords WHERE q.questionId= :questionId")
    int updateQuestionQA(String content, QuestionType category, long duration, String keywords, long questionId);

    @Query("SELECT qa.content,qa.category,qa.duration FROM QuestionQA qa WHERE qa.questionId = :questionId")
    Object getQuestionQASPaiginated(long questionId);

    boolean existsByCategory(QuestionType category);

    @Query("SELECT qa.content,qa.category,qa.duration FROM QuestionQA qa WHERE qa.questionId = :questionId AND qa.category= :category")
    Object getCommonQuestionsPaiginatedByCategory(long questionId, QuestionType category);

    boolean existsByDuration(long duration);

    @Query("SELECT qa.content,qa.category,qa.duration FROM QuestionQA qa WHERE qa.questionId = :questionId AND qa.duration= :duration")
    Object getCommonQuestionsPaiginatedByDuration(long questionId, long duration);

    @Query("SELECT qa.content,qa.category,qa.duration FROM QuestionQA qa WHERE qa.questionId = :questionId AND qa.duration= :duration AND qa.category= :category")
    Object getCommonQuestionsPaiginatedByDurationAndCategory(long questionId, long duration, QuestionType category);

    @Query("SELECT qa.content FROM QuestionQA qa ORDER BY RAND() LIMIT :count_qa")
    List<String> getQuestionsQAByPoistionAndCount(int count_qa);

    boolean getQuestionQAByContentEquals(String content);

    @Query("SELECT qa.duration FROM QuestionQA qa WHERE qa.content= :content")
    int getQuestionQADurationByContentEquals(String content);
}