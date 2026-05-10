package com.matchme.server.controller;

import com.matchme.server.dto.response.*;
import com.matchme.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        return ResponseEntity.ok(userService.getMe(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<MeProfileResponse> getMeProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getMeProfile(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/me/bio")
    public ResponseEntity<BioResponse> getMeBio(Authentication authentication) {
        return ResponseEntity.ok(userService.getMeBio(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(getAuthenticatedUserId(authentication), id));
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(getAuthenticatedUserId(authentication), id));
    }

    @GetMapping("/users/{id}/bio")
    public ResponseEntity<BioResponse> getUserBio(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserBio(getAuthenticatedUserId(authentication), id));
    }
}