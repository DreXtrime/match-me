package com.matchme.server.service;

import com.matchme.server.dto.response.UserResponse;
import com.matchme.server.exception.NotFoundException;
import com.matchme.server.mapper.ServerMapper;
import com.matchme.server.model.User;
import com.matchme.server.repository.ProfileRepository;
import com.matchme.server.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private ServerMapper mapper;

    @InjectMocks
    private UserService userService;

    @Test
    void getMe_returnUserResponse_whenUserExists() {
        UUID userId = UUID.randomUUID();
        User fakeUser = new User();
        fakeUser.setEmail("test@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(fakeUser));
        when(mapper.toUserResponse(any(), anyString(), anyString())).thenReturn(new UserResponse(userId, "test", "test", false));

        UserResponse result = userService.getMe(userId);
        assertThat(result).isNotNull();
    }

    @Test
    void getMe_throwsUserNotFoundException_whenUserDoesNotExist() {
        UUID userId = UUID.randomUUID();
        assertThrows(NotFoundException.class, () -> {
            userService.getMe(userId);
        });
    }
}

