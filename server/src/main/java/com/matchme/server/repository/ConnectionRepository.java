package com.matchme.server.repository;

import com.matchme.server.model.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConnectionRepository extends JpaRepository<Connection, UUID> {

    Optional<Connection> findByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

    Optional<Connection> findByRequesterIdAndReceiverIdAndStatus(UUID requesterId, UUID receiverId, String status);

    // Returns the partner's UUID for each connection — avoids loading full entities
    @Query("""
                SELECT CASE WHEN c.requester.id = :userId THEN c.receiver.id ELSE c.requester.id END
                FROM Connection c
                WHERE (c.requester.id = :userId OR c.receiver.id = :userId)
                AND c.status IN :statuses
            """)
    List<UUID> findPartnerIdsByStatuses(@Param("userId") UUID userId, @Param("statuses") List<String> statuses);

    // Boolean existence check — used instead of loading all connections to call .anyMatch()
    @Query("""
                SELECT COUNT(c) > 0 FROM Connection c
                WHERE (c.requester.id = :userId OR c.receiver.id = :userId)
                AND (c.requester.id = :otherId OR c.receiver.id = :otherId)
                AND c.status IN :statuses
            """)
    boolean existsConnectionBetween(@Param("userId") UUID userId, @Param("otherId") UUID otherId, @Param("statuses") List<String> statuses);

    // For pending requests — only the requester ID is needed, not the full entity
    @Query("SELECT c.requester.id FROM Connection c WHERE c.receiver.id = :receiverId AND c.status = :status")
    List<UUID> findRequesterIdsByReceiverAndStatus(@Param("receiverId") UUID receiverId, @Param("status") String status);

    // Targeted single-connection lookup for disconnect
    @Query("""
                SELECT c FROM Connection c
                WHERE (c.requester.id = :userId OR c.receiver.id = :userId)
                AND (c.requester.id = :otherId OR c.receiver.id = :otherId)
                AND c.status = 'accepted'
            """)
    Optional<Connection> findAcceptedConnectionBetween(@Param("userId") UUID userId, @Param("otherId") UUID otherId);
}
