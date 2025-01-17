package com.aipoweredinterviewmonitoringsystem.user_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

@Repository
@EnableJpaRepositories
public interface UserRepository extends JpaRepository<User, Long> {

}
