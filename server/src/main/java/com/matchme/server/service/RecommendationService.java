package com.matchme.server.service;

import com.matchme.server.dto.response.RecommendationsResponse;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.model.Profile;
import com.matchme.server.repository.ConnectionRepository;
import com.matchme.server.repository.DismissedRepository;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.utils.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    // scoring weights
    private static final int MAX_INTERESTS_POINTS = 35;
    private static final int MAX_FRIDAY_NIGHT_POINTS = 25;
    private static final int MAX_AGE_POINTS = 22;
    private static final int MAX_MUSIC_POINTS = 18;
    private static final int MIN_SCORE_THRESHOLD = 25;

    private final ProfileRepository profileRepository;
    private final ConnectionRepository connectionRepository;
    private final DismissedRepository dismissedRepository;

    public RecommendationsResponse getRecommendations(UUID userId) {

        Profile requester = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Complete your profile before viewing recommendations"));

        if (!isProfileComplete(requester)) {
            throw new BadRequestException("Complete your profile before viewing recommendations");
        }

        Set<UUID> dismissedIds = getDismissedIds(userId);
        Set<UUID> connectionIds = getConnectionIds(userId);

        List<UUID> recommendations = profileRepository.findCompleteProfilesExcluding(userId)
                .stream()
                .filter(p -> !dismissedIds.contains(p.getUser().getId()))
                .filter(p -> !connectionIds.contains(p.getUser().getId()))
                .filter(p -> p.getRelationshipGoal().equals(requester.getRelationshipGoal()))
                .filter(p -> isWithinDistance(requester, p))
                .map(p -> new ScoredProfile(p.getUser().getId(), score(requester, p)))
                .filter(sp -> sp.score() > MIN_SCORE_THRESHOLD)
                .sorted(Comparator.comparingInt(ScoredProfile::score).reversed())
                .limit(10)
                .map(ScoredProfile::userId)
                .collect(Collectors.toList());

        return new RecommendationsResponse(recommendations);
    }

    private boolean isProfileComplete(Profile p) {
        return p.getAge() != null
                && p.getRelationshipGoal() != null
                && p.getInterests() != null
                && !p.getInterests().isEmpty()
                && p.getFridayNightActivities() != null
                && !p.getFridayNightActivities().isEmpty()
                && p.getMusicGenres() != null
                && !p.getMusicGenres().isEmpty();
    }

    private Set<UUID> getDismissedIds(UUID userId) {
        return dismissedRepository.findByUserId(userId)
                .stream()
                .map(d -> d.getDismissedUser().getId())
                .collect(Collectors.toSet());
    }

    private Set<UUID> getConnectionIds(UUID userId) {
        return connectionRepository.findByUserIdAndStatuses(userId, List.of("accepted", "pending"))
                .stream()
                .map(c -> c.getRequester().getId().equals(userId)
                        ? c.getReceiver().getId()
                        : c.getRequester().getId())
                .collect(Collectors.toSet());
    }

    private boolean isWithinDistance(Profile requester, Profile candidate) {
        if (requester.getLatitude() == null || requester.getLongitude() == null
                || requester.getMaxDistanceKm() == null) {
            return true;
        }

        if (candidate.getLatitude() == null || candidate.getLongitude() == null) {
            return false;
        }

        double distance = GeoUtils.calculateDistance(
                requester.getLatitude().doubleValue(),
                requester.getLongitude().doubleValue(),
                candidate.getLatitude().doubleValue(),
                candidate.getLongitude().doubleValue()
        );
        return distance <= requester.getMaxDistanceKm();
    }

    private int score(Profile requester, Profile candidate) {
        int score = 0;

        score += scoreOverlap(requester.getInterests(), candidate.getInterests(), MAX_INTERESTS_POINTS);
        score += scoreOverlap(requester.getFridayNightActivities(), candidate.getFridayNightActivities(), MAX_FRIDAY_NIGHT_POINTS);
        score += scoreAge(requester.getAge(), candidate.getAge());
        score += scoreOverlap(requester.getMusicGenres(), candidate.getMusicGenres(), MAX_MUSIC_POINTS);

        return score;
    }

    private int scoreOverlap(List<String> a, List<String> b, int maxPoints) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) return 0;
        long overlap = a.stream().filter(b::contains).count();
        double percentage = (double) overlap / Math.max(a.size(), b.size());
        return (int) Math.round(percentage * maxPoints);
    }

    private int scoreAge(int requesterAge, int candidateAge) {
        int diff = Math.abs(requesterAge - candidateAge);
        if (diff <= 2) return MAX_AGE_POINTS;
        if (diff <= 5) return (int) (MAX_AGE_POINTS * 0.66);
        if (diff <= 10) return (int) (MAX_AGE_POINTS * 0.33);
        return 0;
    }

    private record ScoredProfile(UUID userId, int score) {}
}