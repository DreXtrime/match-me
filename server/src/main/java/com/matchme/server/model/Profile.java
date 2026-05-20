package com.matchme.server.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles", indexes = {
        @Index(name = "idx_profile_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column
    private Integer maxDistanceKm;

    @Column
    private Integer age;

    @ElementCollection
    @CollectionTable(name = "interests", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "interest")
    @BatchSize(size = 50)
    private List<String> interests;

    @ElementCollection
    @CollectionTable(name = "friday_night_activities", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "activity")
    @BatchSize(size = 50)
    private List<String> fridayNightActivities;

    @ElementCollection
    @CollectionTable(name = "music_genres", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "genre")
    @BatchSize(size = 50)
    private List<String> musicGenres;

    @Column
    private String relationshipGoal;

    @Column
    private String profilePictureUrl;

    @Column
    private LocalDateTime createdAt = LocalDateTime.now();
}