package com.jw.gymmanager.repository;

import com.jw.gymmanager.entity.Quota;
import com.jw.gymmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuotaRepository extends JpaRepository<Quota, Integer> {
    Optional<List<Quota>> findQuotasByCoach(User coach);
    Optional<List<Quota>> findQuotasByTrainee(User trainee);
    Optional<Quota> findQuotaByCoachAndTrainee(User coach, User Trainee);
}
