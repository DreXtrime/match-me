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

        @Min(value = 1, message = "Max distance must be at least 1 km")
        @Max(value = 20000, message = "Max distance cannot exceed 20000 km")
        Integer maxDistanceKm,

        @DecimalMin(value = "-90", message = "Latitude must be between -90 and 90")
        @DecimalMax(value = "90", message = "Latitude must be between -90 and 90")
        BigDecimal latitude,

        @DecimalMin(value = "-180", message = "Longitude must be between -180 and 180")
        @DecimalMax(value = "180", message = "Longitude must be between -180 and 180")
        BigDecimal longitude
) {}