package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.HrTeam;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@EnableJpaRepositories
@Repository
public interface HrTeamRepository extends JpaRepository<HrTeam, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE HrTeam h SET h.comment = :comment WHERE h.userId = :userId")
    void saveComment(@Param("userId") long userId, @Param("comment") String comment);
}
