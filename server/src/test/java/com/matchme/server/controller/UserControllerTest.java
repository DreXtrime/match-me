package com.matchme.server.controller;

import com.matchme.server.security.JwtFilter;
import com.matchme.server.security.JwtUtil;
import com.matchme.server.security.SecurityConfig;
import com.matchme.server.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class, includeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {SecurityConfig.class, JwtFilter.class})
})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getMe_returns401_whenNoTokenProvided() throws Exception {
        mockMvc.perform(get("/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMe_returns200_whenValidTokenProvided() throws Exception {
        UUID uuid = UUID.randomUUID();
        when(jwtUtil.isTokenValid(anyString())).thenReturn(true);
        when(jwtUtil.extractUserId(anyString())).thenReturn(uuid);
        mockMvc.perform(get("/me")
                .header("Authorization", "Bearer " + uuid))
                .andExpect(status().isOk());
    }

}