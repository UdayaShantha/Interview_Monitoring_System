package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.dto.response.UpdateResponseDTO;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.CommonQuestion;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.enums.QuestionType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
@EnableJpaRepositories
@Transactional
public interface CommonQuestionRepository extends JpaRepository<CommonQuestion,Long> {

    @Modifying
    @Query("DELETE FROM CommonQuestion c WHERE c.questionId = :questionId")
    void deleteAllByQuestionId(long questionId);

    @Query("SELECT c.content,c.category,c.duration,c.keywords FROM CommonQuestion c WHERE c.questionId = :questionId")
    Object getCommonQuestionByQuestionId(long questionId);

    @Modifying
    @Query("UPDATE CommonQuestion c SET c.content= :content, c.category= :category, c.duration= :duration, c.keywords= :keywords WHERE c.questionId= :questionId")
    int updateCommonQuestion(String content, QuestionType category, long duration, String keywords, long questionId);

    @Query("SELECT c.content,c.category,c.duration FROM CommonQuestion c WHERE c.questionId = :questionId")
    Object getCommonQuestionsPaiginated(long questionId);

    boolean existsByCategory(QuestionType category);

    @Query("SELECT c.content,c.category,c.duration FROM CommonQuestion c WHERE c.questionId = :questionId AND c.category= :category")
    Object getCommonQuestionsPaiginatedByCategory(long questionId, QuestionType category);

    boolean existsByDuration(long duration);

    @Query("SELECT c.content,c.category,c.duration FROM CommonQuestion c WHERE c.questionId = :questionId AND c.duration= :duration")
    Object getCommonQuestionsPaiginatedByDuration(long questionId, long duration);

    @Query("SELECT c.content,c.category,c.duration FROM CommonQuestion c WHERE c.questionId = :questionId AND c.duration= :duration AND c.category= :category")
    Object getCommonQuestionsPaiginatedByDurationAndCategory(long questionId, long duration, QuestionType category);

    @Query(value = "SELECT c FROM CommonQuestion c ORDER BY RANDOM() LIMIT :count_c")
    List<CommonQuestion> getCommonQuestionByCount(int count_c);

    boolean existsByQuestionIdAndDuration(long questionId, long duration);

    boolean existsByQuestionIdAndCategory(long questionId, QuestionType category);

    boolean existsByContent(String content);

    @Query(value = "SELECT c.duration FROM CommonQuestion c WHERE c.content= :content")
    int getCommonQuestionDurationByContent(String content);

//    @Query(value = "SELECT c FROM CommonQuestion c WHERE SUM(c.duration)= :durationC ORDER BY RANDOM() LIMIT :count_c")
//    List<CommonQuestion> getCommonQuestionByCountANDDuration(int countC, int durationC);
}