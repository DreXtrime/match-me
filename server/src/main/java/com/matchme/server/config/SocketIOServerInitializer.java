package com.matchme.server.config;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SocketIOServerInitializer {

    private final SocketIOServer socketIOServer;

    @EventListener(ApplicationReadyEvent.class)
    public void startSocketIOServer() {
        try {
            socketIOServer.start();
            log.info("Socket.IO server started successfully");
        } catch (Exception e) {
            log.error("Failed to start Socket.IO server", e);
        }
    }
}
