package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
}
