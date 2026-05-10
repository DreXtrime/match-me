package com.matchme.server.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID senderId,
        String content,
        boolean isRead,
        LocalDateTime createdAt
) {}