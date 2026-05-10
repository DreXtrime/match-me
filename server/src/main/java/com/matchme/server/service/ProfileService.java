package com.matchme.server.service;

import com.matchme.server.dto.request.UpdateBioRequest;
import com.matchme.server.dto.request.UpdateProfileRequest;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.model.Dismissed;
import com.matchme.server.model.Profile;
import com.matchme.server.model.User;
import com.matchme.server.repository.DismissedRepository;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DismissedRepository dismissedRepository;

    public SimpleResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElse(new Profile());

        if ((request.latitude() == null) != (request.longitude() == null)) {
            throw new BadRequestException("Latitude and longitude must both be provided or both be null");
        }

        profile.setUser(user);
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setAboutMe(request.aboutMe());
        profile.setMaxDistanceKm(request.maxDistanceKm());
        profile.setLatitude(request.latitude());
        profile.setLongitude(request.longitude());

        profileRepository.save(profile);
        return new SimpleResponse("Updated");
    }

    public SimpleResponse updateBio(UUID userId, UpdateBioRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Complete your profile before updating bio"));

        if (hasDuplicates(request.interests()) ||
                hasDuplicates(request.fridayNightActivities()) ||
                hasDuplicates(request.musicGenres())) {
            throw new BadRequestException("Duplicate values are not allowed");
        }

        profile.setAge(request.age());
        profile.setInterests(request.interests().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        profile.setFridayNightActivities(request.fridayNightActivities().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        profile.setMusicGenres(request.musicGenres().stream()
                .map(Enum::name)
                .collect(Collectors.toList()));
        profile.setRelationshipGoal(request.relationshipGoal().name());

        profileRepository.save(profile);
        return new SimpleResponse("Updated");
    }

    private boolean hasDuplicates(List<?> list) {
        return list.size() != list.stream().distinct().count();
    }

    public SimpleResponse dismissRecommendation(UUID userId, UUID targetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!dismissedRepository.existsByUserIdAndDismissedUserId(userId, targetId)) {
            Dismissed dismissed = new Dismissed();
            dismissed.setUser(user);
            dismissed.setDismissedUser(target);
            dismissedRepository.save(dismissed);
        }

        return new SimpleResponse("Dismissed");
    }
}