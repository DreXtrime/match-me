package com.matchme.server.dto.response;

import java.util.UUID;

public record ChatItemResponse(
        UUID userId,
        int unreadCount
) {}