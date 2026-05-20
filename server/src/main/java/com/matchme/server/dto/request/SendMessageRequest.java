package com.matchme.server.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        @NotBlank(message = "Message content is required")
        String content
) {}
