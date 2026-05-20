package com.matchme.server.service;

import com.matchme.server.config.WebSocketEventHandler;
import com.matchme.server.dto.response.ConnectionRequestsResponse;
import com.matchme.server.dto.response.ConnectionsResponse;
import com.matchme.server.dto.response.SimpleResponse;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.model.Connection;
import com.matchme.server.model.User;
import com.matchme.server.repository.ConnectionRepository;
import com.matchme.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final WebSocketEventHandler webSocketEventHandler;

    @Transactional(readOnly = true)
    public ConnectionsResponse getConnections(UUID userId) {
        return new ConnectionsResponse(
                connectionRepository.findPartnerIdsByStatuses(userId, List.of("accepted"))
        );
    }

    @Transactional(readOnly = true)
    public ConnectionRequestsResponse getConnectionRequests(UUID userId) {
        return new ConnectionRequestsResponse(
                connectionRepository.findRequesterIdsByReceiverAndStatus(userId, "pending")
        );
    }

    @Transactional
    public SimpleResponse sendRequest(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) {
            throw new BadRequestException("Cannot connect with yourself");
        }

        if (connectionRepository.existsConnectionBetween(requesterId, targetId, List.of("accepted", "pending"))) {
            throw new BadRequestException("Already requested or connected");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setReceiver(target);
        connection.setStatus("pending");

        connectionRepository.save(connection);

        webSocketEventHandler.forwardToUser(targetId, "connection-request",
                Map.of("fromUserId", requesterId.toString()));

        return new SimpleResponse("Request sent");
    }

    @Transactional
    public SimpleResponse acceptRequest(UUID userId, UUID requesterId) {
        Connection connection = connectionRepository
                .findByRequesterIdAndReceiverIdAndStatus(requesterId, userId, "pending")
                .orElseThrow(() -> new BadRequestException("Connection request not found"));

        connection.setStatus("accepted");
        connection.setAcceptedAt(java.time.LocalDateTime.now());
        connectionRepository.save(connection);

        return new SimpleResponse("Connected");
    }

    @Transactional
    public SimpleResponse declineRequest(UUID userId, UUID requesterId) {
        Connection connection = connectionRepository
                .findByRequesterIdAndReceiverIdAndStatus(requesterId, userId, "pending")
                .orElseThrow(() -> new BadRequestException("Connection request not found"));

        connection.setStatus("rejected");
        connectionRepository.save(connection);

        return new SimpleResponse("Declined");
    }

    @Transactional
    public SimpleResponse disconnect(UUID userId, UUID targetId) {
        Connection connection = connectionRepository.findAcceptedConnectionBetween(userId, targetId)
                .orElseThrow(() -> new NotFoundException("Connection not found"));

        connection.setStatus("rejected");
        connectionRepository.save(connection);
        return new SimpleResponse("Disconnected");
    }
}
