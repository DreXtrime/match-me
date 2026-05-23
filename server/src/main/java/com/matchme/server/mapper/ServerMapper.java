package com.matchme.server.mapper;

import com.matchme.server.dto.request.UpdateBioRequest;
import com.matchme.server.dto.request.UpdateProfileRequest;
import com.matchme.server.dto.response.*;
import com.matchme.server.model.Message;
import com.matchme.server.model.Profile;
import com.matchme.server.model.User;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
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

    @Mapping(source = "user.id", target = "id")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "profile.firstName", target = "firstName")
    @Mapping(source = "profile.lastName", target = "lastName")
    @Mapping(source = "profile.aboutMe", target = "aboutMe")
    @Mapping(source = "profilePicture", target = "profilePicture")
    @Mapping(source = "profile.maxDistanceKm", target = "maxDistanceKm")
    @Mapping(source = "profile.latitude", target = "latitude")
    @Mapping(source = "profile.longitude", target = "longitude")
    MeProfileResponse toMeProfileResponse(User user, Profile profile, String profilePicture);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "profile.firstName", target = "firstName")
    @Mapping(source = "profile.lastName", target = "lastName")
    @Mapping(source = "profile.aboutMe", target = "aboutMe")
    @Mapping(source = "profilePicture", target = "profilePicture")
    UserProfileResponse toUserProfileResponse(UUID id, Profile profile, String profilePicture);

    @Mapping(source = "user.id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "profilePicture", target = "profilePicture")
    @Mapping(target = "isOnline", expression = "java(user.isOnline())")
    UserResponse toUserResponse(User user, String name, String profilePicture);

    // Bean-level IGNORE preserves unset fields, but these two are user-clearable from the UI
    // (empty text input → null in the request), so they need SET_TO_NULL to override.
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "profilePictureUrl", source = "profilePictureUrl", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(target = "aboutMe", source = "aboutMe", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    void updateProfileFromRequest(UpdateProfileRequest request, @MappingTarget Profile profile);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "interests", qualifiedByName = "enumListToNames")
    @Mapping(target = "fridayNightActivities", qualifiedByName = "enumListToNames")
    @Mapping(target = "musicGenres", qualifiedByName = "enumListToNames")
    @Mapping(target = "relationshipGoal", qualifiedByName = "enumToName")
    void updateBioFromRequest(UpdateBioRequest request, @MappingTarget Profile profile);

    @Named("enumToName")
    default String enumToName(Enum<?> e) {
        return e == null ? null : e.name();
    }

    @Named("enumListToNames")
    default List<String> enumListToNames(List<? extends Enum<?>> list) {
        if (list == null) return null;
        return list.stream().map(Enum::name).collect(Collectors.toList());
    }
}
