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
@Transactional
public interface QuestionDARepository extends JpaRepository<QuestionDA, Long> {
    @Modifying
    @Query("DELETE FROM QuestionDA qd WHERE qd.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Query("SELECT da.content,da.category,da.duration,da.keywords FROM QuestionDA da WHERE da.questionId = :questionId")
    Object getQuestionDAByQuestionId(long questionId);

    @Modifying
    @Query("UPDATE QuestionDA q SET q.content= :content, q.category= :category, q.duration= :duration, q.keywords= :keywords WHERE q.questionId= :questionId")
    int updateQuestionDA(String content, QuestionType category, long duration, String keywords, long questionId);

    @Query("SELECT da.content,da.category,da.duration FROM QuestionDA da WHERE da.questionId = :questionId")
    Object getQuestionDASPaiginated(long questionId);

    boolean existsByCategory(QuestionType category);

    @Query("SELECT da.content,da.category,da.duration FROM QuestionDA da WHERE da.questionId = :questionId AND da.category= :category")
    Object getCommonQuestionsPaiginatedByCategory(long questionId, QuestionType category);

    boolean existsByDuration(long duration);

    @Query("SELECT da.content,da.category,da.duration FROM QuestionDA da WHERE da.questionId = :questionId AND da.duration= :duration")
    Object getCommonQuestionsPaiginatedByDuration(long questionId, long duration);

    @Query("SELECT da.content,da.category,da.duration FROM QuestionDA da WHERE da.questionId = :questionId AND da.duration= :duration AND da.category= :category")
    Object getCommonQuestionsPaiginatedByDurationAndCategory(long questionId, long duration, QuestionType category);


    @Query("SELECT da.content FROM QuestionDA da ORDER BY RAND() LIMIT :count_da")
    List<String> getQuestionsDAByPositionAndCount(int count_da);

    boolean getQuestionDAByContentEquals(String content);

    @Query("SELECT da.duration FROM QuestionDA da WHERE da.content= :content")
    int getQuestionDADurationByContentEquals(String content);

    boolean existsByQuestionIdAndDuration(long questionId, long duration);

    boolean existsByQuestionIdAndCategory(long questionId, QuestionType category);

}