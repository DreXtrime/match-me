package com.matchme.server.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_message_sender", columnList = "sender_id"),
        @Index(name = "idx_message_receiver", columnList = "receiver_id"),
        @Index(name = "idx_message_receiver_read", columnList = "receiver_id,is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column
    private boolean isRead = false;

    @Column
    private LocalDateTime readAt;

    @Column
    private LocalDateTime createdAt = LocalDateTime.now();
}