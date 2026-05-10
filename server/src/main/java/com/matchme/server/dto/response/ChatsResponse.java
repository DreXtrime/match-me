package com.matchme.server.dto.response;

import java.util.List;

public record ChatsResponse(List<ChatItemResponse> chats) {}