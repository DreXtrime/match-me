package com.matchme.server.dto.response;

import java.util.List;

public record ChatMessagesResponse(
        List<ChatMessageResponse> messages,
        int page,
        int totalPages
) {}