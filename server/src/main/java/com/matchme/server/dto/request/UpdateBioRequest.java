package com.matchme.server.dto.request;

import com.matchme.server.model.enums.FridayNightActivity;
import com.matchme.server.model.enums.Interest;
import com.matchme.server.model.enums.MusicGenre;
import com.matchme.server.model.enums.RelationshipGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

public record UpdateBioRequest(
        @Min(value = 18, message = "Must be at least 18")
        @Max(value = 120, message = "Invalid age")
        Integer age,

        List<Interest> interests,

        List<FridayNightActivity> fridayNightActivities,

        List<MusicGenre> musicGenres,

        RelationshipGoal relationshipGoal
) {}