package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.service.UserService;
import com.jw.gymmanager.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/getInfo")
    public ResponseEntity<JResponse> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo(Util.getCurrentUid()));
    }

    @GetMapping("/getCoaches")
    public ResponseEntity<JResponse> getCoaches() {
        return ResponseEntity.ok(userService.getCoaches());
    }
}
