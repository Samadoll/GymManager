package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.*;
import com.jw.gymmanager.enums.Role;
import com.jw.gymmanager.repository.UserRepository;
import com.jw.gymmanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        var existedUser = userRepository.findByUsername(request.getUsername());
        if (existedUser.isPresent())
            return new AuthenticationResponse();
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .registerTime(new Date().getTime())
                .build();
        userRepository.save(user);
        return AuthenticationResponse.builder().token(JwtUtil.generateToken(user)).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        var user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        return AuthenticationResponse.builder().token(JwtUtil.generateToken(user)).uid(user.getId()).role(user.getRole()).build();
    }

    public AuthenticationResponse checkAuth() {
        if (!(SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof User principal)) return null;
        return AuthenticationResponse.builder()
                .uid(principal.getId())
                .username(principal.getUsername())
                .role(principal.getRole())
                .build();
    }

    public boolean changePassword(int currentUid, String password) {
        var existedUser = userRepository.findById(currentUid).orElseGet(null);
        if (existedUser == null) return false;
        existedUser.setPassword(new BCryptPasswordEncoder().encode(password));
        userRepository.save(existedUser);
        return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(existedUser.getUsername(), password)).isAuthenticated();
    }
}
