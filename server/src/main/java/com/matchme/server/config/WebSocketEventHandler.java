package com.matchme.server.config;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.matchme.server.repository.UserRepository;
import com.matchme.server.security.JwtUtil;
import com.matchme.server.service.UserSessionStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventHandler {

    private final SocketIOServer socketIOServer;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserSessionStore userSessionStore;

    private static final long OFFLINE_GRACE_SECONDS = 300;
    private final ScheduledExecutorService offlineScheduler = Executors.newScheduledThreadPool(2);
    private final ConcurrentHashMap<UUID, ScheduledFuture<?>> pendingOffline = new ConcurrentHashMap<>();

    private UUID extractUserId(SocketIOClient client) {
        try {
            String token = client.getHandshakeData().getUrlParams().get("token").get(0);
            String userIdStr = client.getHandshakeData().getUrlParams().get("userId").get(0);
            if (token == null || userIdStr == null || !jwtUtil.isTokenValid(token)) return null;
            return UUID.fromString(userIdStr);
        } catch (Exception e) {
            return null;
        }
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        UUID userId = extractUserId(client);
        if (userId == null) {
            client.disconnect();
            return;
        }

        // Cancel any pending offline timer from a previous disconnect
        ScheduledFuture<?> timer = pendingOffline.remove(userId);
        if (timer != null) timer.cancel(false);

        userSessionStore.addSession(userId, client.getSessionId().toString());

        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(true);
            userRepository.save(user);
        });

        socketIOServer.getBroadcastOperations().sendEvent("user-online", userId.toString());
        log.info("User {} connected via WebSocket", userId);
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        UUID userId = extractUserId(client);
        if (userId == null) return;

        userSessionStore.removeSession(userId);

        // Delay the offline broadcast so brief tab switches don't show the user as offline
        ScheduledFuture<?> future = offlineScheduler.schedule(
                () -> markOffline(userId),
                OFFLINE_GRACE_SECONDS,
                TimeUnit.SECONDS
        );
        pendingOffline.put(userId, future);

        log.info("User {} disconnected; offline in {}s if no reconnect", userId, OFFLINE_GRACE_SECONDS);
    }

    private void markOffline(UUID userId) {
        if (userId == null) return;
        pendingOffline.remove(userId);
        if (userSessionStore.isOnline(userId)) return; // reconnected within grace period

        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(false);
            userRepository.save(user);
        });

        socketIOServer.getBroadcastOperations().sendEvent("user-offline", userId.toString());
        log.info("User {} marked offline after grace period", userId);
    }

    @OnEvent("user-typing")
    public void onUserTyping(SocketIOClient client, AckRequest ackRequest, Map<String, Object> data) {
        UUID senderId = extractUserId(client);
        if (senderId == null) return;

        String receiverId = (String) data.get("receiverId");
        if (receiverId == null) return;

        forwardToUser(UUID.fromString(receiverId), "user-typing", Map.of("userId", senderId.toString()));
    }

    @OnEvent("user-stopped-typing")
    public void onUserStoppedTyping(SocketIOClient client, AckRequest ackRequest, Map<String, Object> data) {
        UUID senderId = extractUserId(client);
        if (senderId == null) return;

        String receiverId = (String) data.get("receiverId");
        if (receiverId == null) return;

        forwardToUser(UUID.fromString(receiverId), "user-stopped-typing", Map.of("userId", senderId.toString()));
    }

    public void forwardToUser(UUID userId, String event, Object data) {
        userSessionStore.getSessionId(userId).ifPresent(sessionId -> {
            SocketIOClient client = socketIOServer.getClient(UUID.fromString(sessionId));
            if (client != null && client.isChannelOpen()) {
                client.sendEvent(event, data);
            }
        });
    }
}
