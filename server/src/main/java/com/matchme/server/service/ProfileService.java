package com.matchme.server.service;

import com.matchme.server.dto.request.UpdateBioRequest;
import com.matchme.server.dto.request.UpdateProfileRequest;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.mapper.ServerMapper;
import com.matchme.server.model.Dismissed;
import com.matchme.server.model.Profile;
import com.matchme.server.model.User;
import com.matchme.server.repository.DismissedRepository;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DismissedRepository dismissedRepository;
    private final ServerMapper mapper;

    @Transactional
    public SimpleResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElse(new Profile());

        if ((request.latitude() == null) != (request.longitude() == null)) {
            throw new BadRequestException("Latitude and longitude must both be provided or both be null");
        }

        profile.setUser(user);
        mapper.updateProfileFromRequest(request, profile);

        profileRepository.save(profile);
        return new SimpleResponse("Updated");
    }

    @Transactional
    public SimpleResponse updateBio(UUID userId, UpdateBioRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Complete your profile before updating bio"));

        if (request.interests() != null && hasDuplicates(request.interests()))
            throw new BadRequestException("Duplicate values are not allowed");
        if (request.fridayNightActivities() != null && hasDuplicates(request.fridayNightActivities()))
            throw new BadRequestException("Duplicate values are not allowed");
        if (request.musicGenres() != null && hasDuplicates(request.musicGenres()))
            throw new BadRequestException("Duplicate values are not allowed");

        mapper.updateBioFromRequest(request, profile);
        profileRepository.save(profile);
        return new SimpleResponse("Updated");
    }

    private boolean hasDuplicates(List<?> list) {
        return list.size() != list.stream().distinct().count();
    }

    @Transactional
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