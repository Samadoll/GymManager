package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.AuthenticationRequest;
import com.jw.gymmanager.entity.AuthenticationResponse;
import com.jw.gymmanager.entity.RegisterRequest;
import com.jw.gymmanager.service.AuthenticationService;
import com.jw.gymmanager.util.JwtUtil;
import com.jw.gymmanager.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    private String getCookie(String token) {
        var emptyToken = token.isEmpty();
        return ResponseCookie
                .from("jwt", !emptyToken ? "Bearer-" + token : token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(!emptyToken ? 6 * 60 * 60 : 0)
                .build()
                .toString();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        var response = service.register(request);
        if (response.getToken().isEmpty())
            return ResponseEntity.badRequest().body(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var response = service.authenticate(request);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, getCookie(response.getToken())).body(response);
    }

    @GetMapping("/checkAuth")
    public ResponseEntity<AuthenticationResponse> checkAuth() {
        var response = service.checkAuth();
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, getCookie("")).build();
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody HashMap<String, String> data) {
        var password = data.get("password");
        return service.changePassword(Util.getCurrentUid(), password)
                ? ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, getCookie("")).build()
                : ResponseEntity.badRequest().build();
    }
}
