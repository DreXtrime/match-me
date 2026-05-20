package com.matchme.server.mapper;

import com.matchme.server.dto.response.BioResponse;
import com.matchme.server.dto.response.MessageResponse;
import com.matchme.server.model.Message;
import com.matchme.server.model.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ServerMapper {

    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "receiver.id", target = "receiverId")
    @Mapping(source = "read", target = "isRead")
    MessageResponse toMessageResponse(Message message);

    @Mapping(source = "userId", target = "id")
    @Mapping(source = "profile.age", target = "age")
    @Mapping(source = "profile.interests", target = "interests")
    @Mapping(source = "profile.fridayNightActivities", target = "fridayNightActivities")
    @Mapping(source = "profile.musicGenres", target = "musicGenres")
    @Mapping(source = "profile.relationshipGoal", target = "relationshipGoal")
    BioResponse toBioResponse(UUID userId, Profile profile);
}
