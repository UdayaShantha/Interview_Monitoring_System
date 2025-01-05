package com.aipoweredinterviewmonitoringsystem.question_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.QuestionSE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionSERepository extends JpaRepository<QuestionSE, Long> {

}