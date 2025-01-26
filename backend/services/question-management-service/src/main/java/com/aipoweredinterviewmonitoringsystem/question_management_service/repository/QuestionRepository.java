package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    Page<Question> findQuestionsByCreatedAtBefore(LocalDate date, Pageable pageable);

}
