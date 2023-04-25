package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.service.QuotaService;
import com.jw.gymmanager.service.UserService;
import com.jw.gymmanager.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final QuotaService quotaService;

    @GetMapping("/getInfo")
    public ResponseEntity<JResponse> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo(Util.getCurrentUid()));
    }

    @GetMapping("/getCoaches")
    public ResponseEntity<JResponse> getCoaches() {
        return ResponseEntity.ok(userService.getCoaches());
    }

    @GetMapping("/getQuotas")
    public ResponseEntity<JResponse> getQuotas() {
        return ResponseEntity.ok(userService.getQuotas(Util.getCurrentUid()));
    }

    @GetMapping("/getAvailableCoaches")
    public ResponseEntity<JResponse> getAvailableCoaches() {
        return ResponseEntity.ok(userService.getAvailableCoaches(Util.getCurrentUid()));
    }

    @PostMapping("/actionOnQuota")
    public ResponseEntity<Void> actionOnQuota(@RequestBody HashMap<String, String> data) {
        var action = data.get("action");
        var userId = Integer.parseInt(data.get("userId"));
        var quota = Integer.parseInt(data.get("quota"));
        var success = quotaService.actionOnQuota(action, Util.getCurrentUid(), userId, quota);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
}
