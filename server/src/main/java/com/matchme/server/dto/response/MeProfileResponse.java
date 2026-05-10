package com.matchme.server.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record MeProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String aboutMe,
        String profilePicture,
        Integer maxDistanceKm,
        BigDecimal latitude,
        BigDecimal longitude
) {}