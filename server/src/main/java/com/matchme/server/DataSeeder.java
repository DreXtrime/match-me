package com.matchme.server;

import com.matchme.server.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final SeedService seedService;

    @Value("${SEED_DATABASE:false}")
    private boolean seedDatabase;

    @Value("${SEED_USER_COUNT:100}")
    private int seedUserCount;

    @Override
    public void run(ApplicationArguments args) {
        if (seedDatabase) {
            seedService.seed(seedUserCount);
        }
    }
}