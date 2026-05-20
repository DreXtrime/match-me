package com.matchme.server.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        String lastName,

        @Size(max = 500, message = "About me cannot exceed 500 characters")
        String aboutMe,

        String profilePictureUrl,

        Integer maxDistanceKm,

        BigDecimal latitude,

        BigDecimal longitude
) {}