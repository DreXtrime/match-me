package com.matchme.server.repository;

import com.matchme.server.model.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConnectionRepository extends JpaRepository<Connection, UUID> {
    List<Connection> findByReceiverIdAndStatus(UUID receiverId, String status);
    Optional<Connection> findByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

    @Query("""
                SELECT c FROM Connection c
                WHERE (c.requester.id = :userId OR c.receiver.id = :userId)
                AND c.status IN :statuses
            """)
    List<Connection> findByUserIdAndStatuses(@Param("userId") UUID userId, @Param("statuses") List<String> statuses);
}