package com.matchme.server.service;

import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserSessionStore {

    private final ConcurrentHashMap<UUID, String> userSessions = new ConcurrentHashMap<>();

    public void addSession(UUID userId, String sessionId) {
        userSessions.put(userId, sessionId);
    }

    public void removeSession(UUID userId) {
        userSessions.remove(userId);
    }

    public Optional<String> getSessionId(UUID userId) {
        return Optional.ofNullable(userSessions.get(userId));
    }

    public boolean isOnline(UUID userId) {
        return userSessions.containsKey(userId);
    }
}
