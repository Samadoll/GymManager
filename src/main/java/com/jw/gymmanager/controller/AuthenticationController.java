package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.AuthenticationRequest;
import com.jw.gymmanager.entity.AuthenticationResponse;
import com.jw.gymmanager.entity.RegisterRequest;
import com.jw.gymmanager.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        var response = service.register(request);
        if (response.getToken().isEmpty())
            return ResponseEntity.badRequest().body(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/checkAuth")
    public ResponseEntity<AuthenticationResponse> checkAuth() {
        return ResponseEntity.ok(service.checkAuth());
    }
}
