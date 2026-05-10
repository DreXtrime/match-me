package com.matchme.server.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dismissed")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Dismissed {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "dismissed_user_id", nullable = false)
    private User dismissedUser;

    @Column
    private LocalDateTime createdAt = LocalDateTime.now();
}