package com.matchme.server.dto.request;

import com.matchme.server.model.enums.FridayNightActivity;
import com.matchme.server.model.enums.Interest;
import com.matchme.server.model.enums.MusicGenre;
import com.matchme.server.model.enums.RelationshipGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateBioRequest(
        @NotNull(message = "Age is required")
        @Min(value = 18, message = "Must be at least 18")
        @Max(value = 120, message = "Invalid age")
        Integer age,

        @NotEmpty(message = "Select at least one interest")
        List<Interest> interests,

        @NotEmpty(message = "Select at least one favorite friday night activity")
        List<FridayNightActivity> fridayNightActivities,

        @NotEmpty(message = "Select at least one music genre")
        List<MusicGenre> musicGenres,

        @NotNull(message = "Relationship goal is required")
        RelationshipGoal relationshipGoal
) {}