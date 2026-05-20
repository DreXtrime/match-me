package com.matchme.server.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatItemResponse(
        UUID id,
        LocalDateTime lastMessageTime
) {}