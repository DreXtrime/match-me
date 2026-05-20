package com.matchme.server.service;

import com.matchme.server.config.WebSocketEventHandler;
import com.matchme.server.dto.request.SendMessageRequest;
import com.matchme.server.dto.response.*;
import com.matchme.server.exception.BadRequestException;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.mapper.ServerMapper;
import com.matchme.server.model.Message;
import com.matchme.server.model.User;
import com.matchme.server.repository.ConnectionRepository;
import com.matchme.server.repository.MessageRepository;
import com.matchme.server.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final WebSocketEventHandler webSocketEventHandler;
    private final ServerMapper mapper;

    public MessageService(MessageRepository messageRepository,
                          UserRepository userRepository,
                          ConnectionRepository connectionRepository,
                          @Lazy WebSocketEventHandler webSocketEventHandler,
                          ServerMapper mapper) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.webSocketEventHandler = webSocketEventHandler;
        this.mapper = mapper;
    }

    private boolean isConnected(UUID userId, UUID otherId) {
        return connectionRepository.existsConnectionBetween(userId, otherId, List.of("accepted"));
    }

    @Transactional
    public MessageResponse sendMessage(UUID senderId, UUID receiverId, SendMessageRequest request) {
        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Cannot send a message to yourself");
        }
        if (!isConnected(senderId, receiverId)) {
            throw new BadRequestException("You can only message connected users");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new NotFoundException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.content());
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        MessageResponse response = mapper.toMessageResponse(message);

        webSocketEventHandler.forwardToUser(receiverId, "new-message", Map.of(
                "id", message.getId().toString(),
                "senderId", senderId.toString(),
                "receiverId", receiverId.toString(),
                "content", message.getContent(),
                "isRead", false,
                "createdAt", message.getCreatedAt().toString()
        ));
        webSocketEventHandler.forwardToUser(receiverId, "unread-update", Map.of("userId", receiverId.toString()));

        return response;
    }

    @Transactional
    public Page<MessageResponse> getChatMessages(UUID userId, UUID otherId, int page, int size) {
        if (!isConnected(userId, otherId)) {
            throw new BadRequestException("You can only view messages with connected users");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findChatMessages(userId, otherId, pageable);

        int marked = messageRepository.markMessagesAsRead(userId, otherId, LocalDateTime.now());
        if (marked > 0) {
            webSocketEventHandler.forwardToUser(userId, "unread-update", Map.of("userId", userId.toString()));
        }

        return messages.map(mapper::toMessageResponse);
    }

    @Transactional(readOnly = true)
    public ChatsResponse getChats(UUID userId) {
        List<ChatItemResponse> chats = messageRepository.findChatPartners(userId)
                .stream()
                .map(row -> new ChatItemResponse((UUID) row[0], (LocalDateTime) row[1]))
                .collect(Collectors.toList());
        return new ChatsResponse(chats);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @Transactional
    public SimpleResponse markAsRead(UUID userId, UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));

        if (!message.getReceiver().getId().equals(userId)) {
            throw new BadRequestException("You can only mark your own messages as read");
        }

        message.setRead(true);
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);

        webSocketEventHandler.forwardToUser(userId, "unread-update", Map.of("userId", userId.toString()));

        return new SimpleResponse("Message marked as read");
    }
}
