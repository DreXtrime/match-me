package com.matchme.server.service;

import com.matchme.server.dto.response.*;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.mapper.ServerMapper;
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
    private final ServerMapper mapper;

    private String resolveProfilePicture(User user, Profile profile) {
        if (profile != null && profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isBlank()) {
            return profile.getProfilePictureUrl();
        }
        return GravatarUtils.getGravatarUrl(user.getEmail());
    }

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

        return recommendationService.getRecommendations(requesterId).recommendations().contains(targetId);
    }

    private UserResponse buildUserResponse(User user, Profile profile) {
        String name = profile != null ? profile.getFirstName() + " " + profile.getLastName() : "";
        return new UserResponse(user.getId(), name, resolveProfilePicture(user, profile), user.isOnline());
    }

    public UserResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return buildUserResponse(user, profileRepository.findByUserId(userId).orElse(null));
    }

    public MeProfileResponse getMeProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Profile not found"));
        return new MeProfileResponse(
                user.getId(),
                user.getEmail(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getAboutMe(),
                resolveProfilePicture(user, profile),
                profile.getMaxDistanceKm(),
                profile.getLatitude(),
                profile.getLongitude()
        );
    }

    public BioResponse getMeBio(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Profile not found"));
        return mapper.toBioResponse(userId, profile);
    }

    public UserResponse getUserById(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) throw new NotFoundException("Not found");
        User user = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        return buildUserResponse(user, profileRepository.findByUserId(targetId).orElse(null));
    }

    public UserProfileResponse getUserProfile(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) throw new NotFoundException("Not found");
        Profile profile = profileRepository.findByUserId(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        User user = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        return new UserProfileResponse(
                targetId,
                profile.getFirstName(),
                profile.getLastName(),
                profile.getAboutMe(),
                resolveProfilePicture(user, profile)
        );
    }

    public BioResponse getUserBio(UUID requesterId, UUID targetId) {
        if (!canViewProfile(requesterId, targetId)) throw new NotFoundException("Not found");
        Profile profile = profileRepository.findByUserId(targetId)
                .orElseThrow(() -> new NotFoundException("Not found"));
        return mapper.toBioResponse(targetId, profile);
    }
}
