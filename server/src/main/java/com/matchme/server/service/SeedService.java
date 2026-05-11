package com.matchme.server.service;

import com.matchme.server.model.Profile;
import com.matchme.server.model.User;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SeedService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "password";

    private static final String[] FIRST_NAMES = {
            "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
            "Iris", "Jack", "Karen", "Leo", "Mia", "Noah", "Olivia", "Paul",
            "Marten", "Katrin", "Sepo", "Liina", "Georg", "Patrick", "Liis", "Sander",
            "Yara", "Zoe", "Aaron", "Bella", "Carl", "Daisy"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
            "Davis", "Roots", "Kalberg", "Liiva", "Moon", "Grüntal", "Tamm",
            "Harris", "Martin", "Thompson", "Young", "Allen", "King"
    };

    private static final String[] INTERESTS = {
            "gaming", "fitness", "music", "programming", "art",
            "reading", "travel", "food", "movies", "sports"
    };

    private static final String[] FRIDAY_NIGHT_ACTIVITIES = {
            "bar_hopping", "house_party", "gaming", "movies_at_home", "restaurant",
            "clubbing", "board_games", "concert", "takeaway_and_chill", "outdoor_bonfire"
    };

    private static final String[] MUSIC_GENRES = {
            "rock", "pop", "hiphop", "electronic", "jazz",
            "classical", "metal", "indie"
    };

    private static final String[] RELATIONSHIP_GOALS = {
            "friendship", "dating", "networking", "activity"
    };

    private static final String[] ABOUT_ME_TEMPLATES = {
            "Love exploring new places and meeting new people.",
            "Coffee addict and bookworm.",
            "Always up for an adventure.",
            "Looking for like-minded people to hang out with.",
            "Passionate about music and good food.",
            "Tech enthusiast by day, gamer by night.",
            "Fitness lover who enjoys cooking.",
            "Creative soul who loves art and travel.",
            "Outdoor enthusiast and dog lover.",
            "Movie buff and amateur chef."
    };

    // Tallinn
    private static final double BASE_LAT = 59.4370;
    private static final double BASE_LON = 24.7536;

    public void seed(int count) {
        long existing = userRepository.count();
        if (existing >= count) {
            System.out.println("Database already has " + existing + " users, skipping seed.");
            return;
        }

        int toCreate = (int) (count - existing);

        Random random = new Random();
        String hashedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);
        int created = 0;

        for (int i = 0; i < toCreate; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@example.com";

            if (userRepository.findByEmail(email).isPresent()) continue;

            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(hashedPassword);
            userRepository.save(user);

            Profile profile = new Profile();
            profile.setUser(user);
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            profile.setAboutMe(ABOUT_ME_TEMPLATES[random.nextInt(ABOUT_ME_TEMPLATES.length)]);
            profile.setAge(18 + random.nextInt(42));
            profile.setRelationshipGoal(RELATIONSHIP_GOALS[random.nextInt(RELATIONSHIP_GOALS.length)]);
            profile.setInterests(randomSubset(INTERESTS, random, 2, 5));
            profile.setFridayNightActivities(randomSubset(FRIDAY_NIGHT_ACTIVITIES, random, 2, 5));
            profile.setMusicGenres(randomSubset(MUSIC_GENRES, random, 1, 4));

            // random location around Tallinn
            double lat = BASE_LAT + (random.nextDouble() - 0.5) * 0.9;
            double lon = BASE_LON + (random.nextDouble() - 0.5) * 1.5;
            profile.setLatitude(BigDecimal.valueOf(lat));
            profile.setLongitude(BigDecimal.valueOf(lon));
            profile.setMaxDistanceKm(10 + random.nextInt(91));

            profileRepository.save(profile);
            created++;
        }

        System.out.println("Seeded " + created + " users.");
    }

    private List<String> randomSubset(String[] options, Random random, int min, int max) {
        List<String> list = new ArrayList<>(List.of(options));
        Collections.shuffle(list, random);
        int count = min + random.nextInt(max - min + 1);
        return new ArrayList<>(list.subList(0, Math.min(count, list.size())));
    }
}