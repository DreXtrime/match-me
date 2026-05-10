package com.matchme.server.dto.response;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String aboutMe,
        String profilePicture
) {}