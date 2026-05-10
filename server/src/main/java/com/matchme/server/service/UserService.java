package com.matchme.server.service;

import com.matchme.server.dto.response.*;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.model.Profile;
import com.matchme.server.model.User;
import com.matchme.server.repository.ConnectionRepository;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.repository.UserRepository;
import com.matchme.server.utils.GravatarUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ConnectionRepository connectionRepository;
    private final RecommendationService recommendationService;

    private boolean canViewProfile(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) return true;

        boolean isRejected = connectionRepository.findByUserIdAndStatuses(requesterId, List.of("rejected"))
                .stream()
                .anyMatch(c -> c.getRequester().getId().equals(targetId)
                        || c.getReceiver().getId().equals(targetId));

        if (isRejected) return false;

        boolean hasConnection = connectionRepository.findByUserIdAndStatuses(requesterId, List.of("accepted", "pending"))
                .stream()
                .anyMatch(c -> c.getRequester().getId().equals(targetId)
                        || c.getReceiver().getId().equals(targetId));

        if (hasConnection) return true;

        return recommendationService.getRecommendations(requesterId)
                .recommendations()
                .contains(targetId);
    }

    // /me
    public UserResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        String name = profile != null ? profile.getFirstName() + " " + profile.getLastName() : "";
        return new UserResponse(user.getId(), name, GravatarUtils.getGravatarUrl(user.getEmail()));
    }

    // /me/profile
    public MeProfileResponse getMeProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        return new MeProfileResponse(
                user.getId(),
                user.getEmail(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getAboutMe(),
                GravatarUtils.getGravatarUrl(user.getEmail()),
                profile.getMaxDistanceKm(),
                profile.getLatitude(),
                profile.getLongitude()
        );
    }

    // /me/bio
    public BioResponse getMeBio(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        return new BioResponse(
                userId,
                profile.getAge(),
                profile.getInterests(),
                profile.getFridayNightActivities(),
                profile.getMusicGenres(),
                profile.getRelationshipGoal()
        );
    }

    // /users/:id
    public UserResponse getUserById(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) {
            throw new NotFoundException("Not found");
        }
        User user = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        Profile profile = profileRepository.findByUserId(targetId).orElse(null);
        String name = "";
        if (profile != null) {
            name = profile.getFirstName() + " " + profile.getLastName();
        }
        return new UserResponse(user.getId(), name, GravatarUtils.getGravatarUrl(user.getEmail()));
    }

    // /users/:id/profile
    public UserProfileResponse getUserProfile(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) {
            throw new NotFoundException("Not found");
        }
        Profile profile = profileRepository.findByUserId(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        User user = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        return new UserProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getAboutMe(),
                GravatarUtils.getGravatarUrl(user.getEmail())
        );
    }

    // /users/:id/bio
    public BioResponse getUserBio(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) {
            throw new NotFoundException("Not found");
        }
        Profile profile = profileRepository.findByUserId(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        return new BioResponse(
                targetId,
                profile.getAge(),
                profile.getInterests(),
                profile.getFridayNightActivities(),
                profile.getMusicGenres(),
                profile.getRelationshipGoal()
        );
    }
}