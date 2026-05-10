package com.matchme.server.repository;

import com.matchme.server.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUserId(UUID userId);

    // fetch all complete profiles excluding the requesting user
    @Query("""
                SELECT p FROM Profile p
                WHERE p.user.id != :userId
                AND p.age IS NOT NULL
                AND p.relationshipGoal IS NOT NULL
                AND SIZE(p.interests) > 0
                AND SIZE(p.fridayNightActivities) > 0
                AND SIZE(p.musicGenres) > 0
            """)
    List<Profile> findCompleteProfilesExcluding(@Param("userId") UUID userId);
}