package com.matchme.server.controller;

import com.matchme.server.dto.response.ConnectionRequestsResponse;
import com.matchme.server.dto.response.ConnectionsResponse;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<ConnectionsResponse> getConnections(Authentication authentication) {
        return ResponseEntity.ok(connectionService.getConnections(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/requests")
    public ResponseEntity<ConnectionRequestsResponse> getConnectionRequests(Authentication authentication) {
        return ResponseEntity.ok(connectionService.getConnectionRequests(getAuthenticatedUserId(authentication)));
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<SimpleResponse> sendRequest(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(connectionService.sendRequest(getAuthenticatedUserId(authentication), id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<SimpleResponse> acceptRequest(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(connectionService.acceptRequest(getAuthenticatedUserId(authentication), id));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<SimpleResponse> declineRequest(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(connectionService.declineRequest(getAuthenticatedUserId(authentication), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SimpleResponse> disconnect(Authentication authentication, @PathVariable UUID id) {
        return ResponseEntity.ok(connectionService.disconnect(getAuthenticatedUserId(authentication), id));
    }
}