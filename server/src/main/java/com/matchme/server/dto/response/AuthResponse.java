package com.matchme.server.dto.response;

import java.util.UUID;

public record AuthResponse(UUID userId, String token) {}