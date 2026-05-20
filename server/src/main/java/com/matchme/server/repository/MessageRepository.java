package com.matchme.server.repository;

import com.matchme.server.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE " +
            "((m.sender.id = :userId AND m.receiver.id = :otherId) OR " +
            "(m.sender.id = :otherId AND m.receiver.id = :userId)) " +
            "ORDER BY m.createdAt DESC")
    Page<Message> findChatMessages(@Param("userId") UUID userId, @Param("otherId") UUID otherId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    List<Message> findUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT m.receiver.id FROM Message m WHERE m.sender.id = :userId")
    List<UUID> findSentToPartnerIds(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT m.sender.id FROM Message m WHERE m.receiver.id = :userId")
    List<UUID> findReceivedFromPartnerIds(@Param("userId") UUID userId);

    @Query("SELECT m FROM Message m WHERE " +
            "((m.sender.id = :userId AND m.receiver.id = :otherId) OR " +
            "(m.sender.id = :otherId AND m.receiver.id = :userId)) " +
            "ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessage(@Param("userId") UUID userId, @Param("otherId") UUID otherId);
}
