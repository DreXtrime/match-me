package com.matchme.server.controller;

import com.matchme.server.dto.response.RecommendationsResponse;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.service.ProfileService;
import com.matchme.server.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final ProfileService profileService;

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationsResponse> getRecommendations(Authentication authentication) {
        return ResponseEntity.ok(recommendationService.getRecommendations(getAuthenticatedUserId(authentication)));
    }

    @PostMapping("/recommendations/{id}/dismiss")
    public ResponseEntity<SimpleResponse> dismiss(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(profileService.dismissRecommendation(getAuthenticatedUserId(authentication), id));
    }
}