package com.matchme.server.dto.response;

import java.util.List;
import java.util.UUID;

public record ConnectionRequestsResponse(List<UUID> requests) {}