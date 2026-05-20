package com.matchme.server.repository;

import com.matchme.server.model.Dismissed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;
import java.util.UUID;

public interface DismissedRepository extends JpaRepository<Dismissed, UUID> {

    boolean existsByUserIdAndDismissedUserId(UUID userId, UUID dismissedUserId);

    // Returns only dismissed user IDs — avoids loading full Dismissed entities and lazy-loading dismissedUser
    @Query("SELECT d.dismissedUser.id FROM Dismissed d WHERE d.user.id = :userId")
    Set<UUID> findDismissedUserIds(@Param("userId") UUID userId);
}
