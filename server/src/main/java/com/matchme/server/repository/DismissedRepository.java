package com.matchme.server.repository;

import com.matchme.server.model.Dismissed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DismissedRepository extends JpaRepository<Dismissed, UUID> {
    List<Dismissed> findByUserId(UUID userId);
    boolean existsByUserIdAndDismissedUserId(UUID userId, UUID dismissedUserId);
}