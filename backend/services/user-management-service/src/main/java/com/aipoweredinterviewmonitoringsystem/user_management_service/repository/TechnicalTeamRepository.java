package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.TechnicalTeam;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@EnableJpaRepositories
@Repository
public interface TechnicalTeamRepository extends CrudRepository<TechnicalTeam, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE TechnicalTeam t SET t.comment = :comment WHERE t.userId = :userId")
    void saveComment(@Param("userId") long userId, @Param("comment") String comment);

}
