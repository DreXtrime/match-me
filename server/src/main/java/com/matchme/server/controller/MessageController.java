package com.matchme.server.controller;

import com.matchme.server.dto.request.SendMessageRequest;
import com.matchme.server.dto.response.*;
import com.matchme.server.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            Authentication authentication,
            @RequestParam UUID receiverId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(getAuthenticatedUserId(authentication), receiverId, request));
    }

    @GetMapping("/chats/{userId}/messages")
    public ResponseEntity<Page<MessageResponse>> getChatMessages(
            Authentication authentication,
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messageService.getChatMessages(
                getAuthenticatedUserId(authentication), userId, page, size));
    }

    @GetMapping("/chats")
    public ResponseEntity<ChatsResponse> getChats(Authentication authentication) {
        return ResponseEntity.ok(messageService.getChats(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/messages/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = messageService.getUnreadCount(getAuthenticatedUserId(authentication));
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<SimpleResponse> markAsRead(
            Authentication authentication,
            @PathVariable UUID id) {
        return ResponseEntity.ok(messageService.markAsRead(getAuthenticatedUserId(authentication), id));
    }
}
