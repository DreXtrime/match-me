package com.matchme.server.dto.response;

import java.util.List;
import java.util.UUID;

public record BioResponse(
        UUID id,
        Integer age,
        List<String> interests,
        List<String> fridayNightActivities,
        List<String> musicGenres,
        String relationshipGoal
) {}