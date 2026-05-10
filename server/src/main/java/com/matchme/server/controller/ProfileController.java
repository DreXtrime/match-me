package com.matchme.server.controller;

import com.matchme.server.dto.request.UpdateBioRequest;
import com.matchme.server.dto.request.UpdateProfileRequest;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @PutMapping("/me/profile")
    public ResponseEntity<SimpleResponse> updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(getAuthenticatedUserId(authentication), request));
    }

    @PutMapping("/me/bio")
    public ResponseEntity<SimpleResponse> updateBio(Authentication authentication, @Valid @RequestBody UpdateBioRequest request) {
        return ResponseEntity.ok(profileService.updateBio(getAuthenticatedUserId(authentication), request));
    }
}