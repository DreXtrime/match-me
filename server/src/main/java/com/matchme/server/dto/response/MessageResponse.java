package com.matchme.server.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID senderId,
        UUID receiverId,
        String content,
        boolean isRead,
        LocalDateTime createdAt
) {}
