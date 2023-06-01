package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Quota;
import com.jw.gymmanager.enums.Role;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final QuotaService quotaService;

    public JResponse getUserInfo(int uid) {
        var user = userRepository.findById(uid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        existedUser.setPassword("");
        return JResponse.builder()
                .status(200)
                .data(existedUser)
                .build();
    }

    public JResponse getCoaches() {
        var coaches = userRepository.findUsersByRole(Role.COACH);
        if (coaches.isEmpty())
            return JResponse.builder().status(400).message("No Coaches").build();
        return JResponse.builder().status(200).data(coaches.orElseGet(ArrayList::new)).build();
    }

    public JResponse getQuotas(int uid) {
        var user = userRepository.findById(uid).orElse(null);
        if (user == null) return JResponse.builder().status(400).message("User Not Exist").build();
        return JResponse.builder().status(200).data(quotaService.getQuota(user)).build();
    }

    public JResponse getAvailableCoaches(int uid) {
        var user = userRepository.findById(uid).orElse(null);
        if (user == null || user.getRole() == Role.COACH) return JResponse.builder().status(400).message("User Not Available").build();
        var quotas = quotaService.getQuota(user);
        var quotaIds = new HashSet<Integer>();
        for(Quota quota : quotas) {
            quotaIds.add(quota.getCoach().getId());
        }
        var coaches = userRepository.findUsersByRole(Role.COACH).orElseGet(ArrayList::new)
                .stream()
                .filter(t -> !quotaIds.contains(t.getId()))
                .collect(Collectors.toList());
        return JResponse.builder().status(200).data(coaches).build();
    }
}
