package com.matchme.server.dto.response;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String profilePicture
) {}