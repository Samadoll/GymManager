package com.jw.gymmanager.repository;

import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);
    Optional<List<User>> findUsersByRole(Role role);

}
