package com.matchme.server.repository;

import com.matchme.server.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE " +
            "((m.sender.id = :userId AND m.receiver.id = :otherId) OR " +
            "(m.sender.id = :otherId AND m.receiver.id = :userId)) " +
            "ORDER BY m.createdAt DESC")
    Page<Message> findChatMessages(@Param("userId") UUID userId, @Param("otherId") UUID otherId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") UUID userId);

    // Single batch UPDATE instead of N individual saves in getChatMessages
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :now WHERE m.receiver.id = :userId AND m.sender.id = :otherId AND m.isRead = false")
    int markMessagesAsRead(@Param("userId") UUID userId, @Param("otherId") UUID otherId, @Param("now") LocalDateTime now);

    // Returns (partnerId, lastMessageTime) pairs in one query instead of 2+N queries in getChats
    @Query("""
                SELECT
                    CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END,
                    MAX(m.createdAt)
                FROM Message m
                WHERE m.sender.id = :userId OR m.receiver.id = :userId
                GROUP BY CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END
                ORDER BY MAX(m.createdAt) DESC
            """)
    List<Object[]> findChatPartners(@Param("userId") UUID userId);
}
