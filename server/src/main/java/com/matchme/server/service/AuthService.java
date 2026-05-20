package com.matchme.server.service;

import com.matchme.server.dto.request.LoginRequest;
import com.matchme.server.dto.request.RegisterRequest;
import com.matchme.server.dto.response.AuthResponse;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.model.User;
import com.matchme.server.repository.UserRepository;
import com.matchme.server.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(user.getId(), token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(user.getId(), token);
    }
}
