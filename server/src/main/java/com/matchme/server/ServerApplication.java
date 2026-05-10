package com.matchme.server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServerApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        if (dotenv.get("JWT_SECRET") == null) {
            dotenv = Dotenv.configure()
                    .directory("./server")
                    .ignoreIfMissing()
                    .load();
        }

        dotenv.entries().forEach(e ->
                System.setProperty(e.getKey(), e.getValue())
        );
        SpringApplication.run(ServerApplication.class, args);
    }

}
