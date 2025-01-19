package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionDA;
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
public interface QuestionDARepository extends JpaRepository<QuestionDA, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM QuestionDA qd WHERE qd.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("SELECT da.content,da.category,da.duration,da.keywords FROM QuestionDA da WHERE da.questionId = :questionId")
    Object getQuestionDAByQuestionId(long questionId);

    @Modifying
    @Transactional
    @Query("UPDATE QuestionDA da SET da.content= :content, da.category= :category, da.duration= :duration, da.keywords= :keywords WHERE da.questionId= :questionId")
    Object updateQuestionDA(String content, QuestionType category, long duration, List<String> keywords, long questionId);

    @Modifying
    @Transactional
    @Query("SELECT da.content,da.category,da.duration FROM QuestionDA da WHERE da.questionId = :questionId")
    Object getQuestionDASPaiginated(long questionId);
}