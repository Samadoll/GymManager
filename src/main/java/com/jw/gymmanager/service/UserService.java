package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.entity.User;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public JResponse getUserInfo(int uid) {
        var existedUser = userRepository.findById(uid);
        Assert.notNull(existedUser, "User Not Exist");
        var user = existedUser.get();
        user.setPassword("");
        return JResponse.builder()
                .status(200)
                .data(user)
                .build();
    }

//    public void updatePassword(int uid, String password) {
//        userRepository.updatePassword(uid, new BCryptPasswordEncoder().encode(password));
//    }
}
