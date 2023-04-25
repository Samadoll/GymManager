package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.Quota;
import com.jw.gymmanager.entity.User;
import com.jw.gymmanager.enums.QuotaState;
import com.jw.gymmanager.enums.Role;
import com.jw.gymmanager.repository.QuotaRepository;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaRepository quotaRepository;
    private final UserRepository userRepository;

    public List<Quota> getQuota(User user) {
        List<Quota> quotas = new ArrayList<>();
        if (user.getRole() == Role.TRAINEE) {
            quotas = quotaRepository.findQuotasByTrainee(user).orElseGet(ArrayList::new);
        } else if (user.getRole() == Role.COACH) {
            quotas = quotaRepository.findQuotasByCoach(user).orElseGet(ArrayList::new);
        }
        return quotas;
    }

    public boolean actionOnQuota(String action, int id, int userId, int quota) {
        var currentUser = userRepository.findById(id).orElse(null);
        var targetUser = userRepository.findById(userId).orElse(null);
        if (currentUser == null || targetUser == null) return false;
        return actionOnQuota(action, currentUser, targetUser, quota);
    }

    private boolean actionOnQuota(String action, User currentUser, User targetUser, int quotaAmount) {
        Quota quota;
        if (currentUser.getRole() == Role.COACH) {
            quota = quotaRepository.findQuotaByCoachAndTrainee(currentUser, targetUser).orElse(null);
            if (quota == null || quota.getQuotaState() != QuotaState.REQUESTED) return false;
            switch (action) {
                case "APPROVE" -> quota.setQuotaState(QuotaState.ACTIVE);
                case "DECLINE" -> quota.setQuotaState(QuotaState.DECLINED);
                default -> {
                    return false;
                }
            }
            quotaRepository.save(quota);
            return true;
        } else if (currentUser.getRole() == Role.TRAINEE) {
            switch (action) {
                case "REQUEST" -> {
                    quota = quotaRepository.findQuotaByCoachAndTrainee(targetUser, currentUser).orElse(null);
                    if (quota != null) {
                        if (quota.getQuotaState() == QuotaState.ACTIVE
                                || quota.getQuotaState() == QuotaState.REQUESTED
                                || quota.getQuota() != 0) {
                            return false;
                        }
                    } else {
                        quota = Quota.builder().coach(targetUser).trainee(currentUser).build();
                    }
                    quota.setQuotaState(QuotaState.REQUESTED);
                    quota.setQuota(quotaAmount);
                    quotaRepository.save(quota);
                }
                case "CANCEL" -> {
                    quota = quotaRepository.findQuotaByCoachAndTrainee(targetUser, currentUser).orElse(null);
                    if (quota == null || quota.getQuotaState() == QuotaState.ACTIVE) return false;
                    quotaRepository.delete(quota);
                }
                default -> {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
}
