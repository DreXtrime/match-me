package com.matchme.server.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @Size(max = 500, message = "About me cannot exceed 500 characters")
        String aboutMe,

        @Min(value = 5, message = "Max distance must be at least 5km")
        @Max(value = 2000, message = "Max distance cannot exceed 2000km")
        Integer maxDistanceKm,

        BigDecimal latitude,

        BigDecimal longitude
) {}