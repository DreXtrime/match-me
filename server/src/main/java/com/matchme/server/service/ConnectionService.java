package com.matchme.server.service;

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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ConnectionsResponse getConnections(UUID userId) {
        List<UUID> connections = connectionRepository
                .findByUserIdAndStatuses(userId, List.of("accepted"))
                .stream()
                .map(c -> c.getRequester().getId().equals(userId)
                        ? c.getReceiver().getId()
                        : c.getRequester().getId())
                .collect(Collectors.toList());

        return new ConnectionsResponse(connections);
    }

    public ConnectionRequestsResponse getConnectionRequests(UUID userId) {
        List<UUID> requests = connectionRepository
                .findByReceiverIdAndStatus(userId, "pending")
                .stream()
                .map(c -> c.getRequester().getId())
                .collect(Collectors.toList());

        return new ConnectionRequestsResponse(requests);
    }

    public SimpleResponse sendRequest(UUID requesterId, UUID targetId) {
        if (requesterId.equals(targetId)) {
            throw new BadRequestException("Cannot connect with yourself");
        }

        boolean alreadyExists = connectionRepository
                .findByUserIdAndStatuses(requesterId, List.of("accepted", "pending", "rejected"))
                .stream()
                .anyMatch(c -> c.getRequester().getId().equals(targetId)
                        || c.getReceiver().getId().equals(targetId));

        if (alreadyExists) {
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
        return new SimpleResponse("Request sent");
    }

    public SimpleResponse acceptRequest(UUID userId, UUID requesterId) {
        Connection connection = connectionRepository
                .findByRequesterIdAndReceiverId(requesterId, userId)
                .orElseThrow(() -> new BadRequestException("Connection request not found"));

        if (!connection.getStatus().equals("pending")) {
            throw new BadRequestException("Connection request is not pending");
        }

        connection.setStatus("accepted");
        connection.setAcceptedAt(java.time.LocalDateTime.now());
        connectionRepository.save(connection);

        return new SimpleResponse("Connected");
    }

    public SimpleResponse declineRequest(UUID userId, UUID requesterId) {
        Connection connection = connectionRepository
                .findByRequesterIdAndReceiverId(requesterId, userId)
                .orElseThrow(() -> new BadRequestException("Connection request not found"));

        connection.setStatus("rejected");
        connectionRepository.save(connection);

        return new SimpleResponse("Declined");
    }

    public SimpleResponse disconnect(UUID userId, UUID targetId) {
        Connection connection = connectionRepository
                .findByUserIdAndStatuses(userId, List.of("accepted"))
                .stream()
                .filter(c -> c.getRequester().getId().equals(targetId)
                        || c.getReceiver().getId().equals(targetId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Connection not found"));

        connection.setStatus("rejected");
        connectionRepository.save(connection);
        return new SimpleResponse("Disconnected");
    }
}