package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    Page<Question> findQuestionsByCreatedAtBefore(LocalDateTime date, Pageable pageable);
}
