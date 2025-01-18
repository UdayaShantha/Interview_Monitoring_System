package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
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
public interface CommonQuestionRepository extends JpaRepository<CommonQuestion,Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM CommonQuestion c WHERE c.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("SELECT c.category,c.category,c.duration,c.keywords FROM CommonQuestion c WHERE c.questionId = :questionId")
    Object getCommonQuestionByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("UPDATE CommonQuestion c SET c.content= :content, c.category= :category, c.duration= :duration, c.keywords= :keywords WHERE c.questionId= :questionId")
    Object updateCommonQuestion(String content, QuestionType category, long duration, List<String> keywords, long questionId);
}