package com.cuteicles.backend.integration;

import com.cuteicles.backend.auth.PasswordResetToken;
import com.cuteicles.backend.auth.PasswordResetTokenRepository;
import com.cuteicles.backend.security.JwtService;
import com.cuteicles.backend.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Email-code password reset: expiry, 5-guess limit, single use. NOT YET RUN (no Maven access when written). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PasswordResetCodeIT {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired PasswordResetTokenRepository tokens;
    @Autowired JwtService jwt;

    private static final String EMAIL = "otp.user@example.test";
    private static final String OLD = "Str0ng!Passw0rd";
    private static final String NEW = "N3w!Passw0rd-ok";

    private Long registerUser() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Otp User\",\"email\":\"" + EMAIL + "\",\"phone\":\"9876543210\",\"password\":\"" + OLD + "\"}"))
                .andExpect(status().is2xxSuccessful());
        return users.findByEmailIgnoreCase(EMAIL).orElseThrow().getId();
    }

    private void plantCode(Long userId, String code, Instant expires) {
        tokens.invalidateAllForUser(userId, Instant.now());
        tokens.save(new PasswordResetToken(userId, jwt.hmacHex(userId + ":" + code), expires, Instant.now()));
    }

    private int reset(String code, String password) throws Exception {
        return mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\",\"code\":\"" + code + "\",\"newPassword\":\"" + password + "\"}"))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void rightCodeWorksOnceAndOldPasswordStopsWorking() throws Exception {
        Long id = registerUser();
        plantCode(id, "123456", Instant.now().plus(10, ChronoUnit.MINUTES));
        org.junit.jupiter.api.Assertions.assertEquals(400, reset("654321", NEW));
        org.junit.jupiter.api.Assertions.assertEquals(200, reset("123456", NEW));
        org.junit.jupiter.api.Assertions.assertEquals(400, reset("123456", NEW), "a code works only once");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + OLD + "\"}")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + NEW + "\"}")).andExpect(status().isOk());
    }

    @Test
    void codeIsBurnedAfterFiveWrongGuesses() throws Exception {
        Long id = registerUser();
        plantCode(id, "111111", Instant.now().plus(10, ChronoUnit.MINUTES));
        for (int i = 0; i < 5; i++) {
            org.junit.jupiter.api.Assertions.assertEquals(400, reset("00000" + i, NEW));
        }
        org.junit.jupiter.api.Assertions.assertEquals(400, reset("111111", NEW), "right code is refused after 5 misses");
    }

    @Test
    void expiredCodeIsRefused() throws Exception {
        Long id = registerUser();
        plantCode(id, "222222", Instant.now().minus(1, ChronoUnit.MINUTES));
        org.junit.jupiter.api.Assertions.assertEquals(400, reset("222222", NEW));
    }

    @Test
    void unknownEmailGetsTheSameAnswerAsAWrongCode() throws Exception {
        mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@example.test\",\"code\":\"123456\",\"newPassword\":\"" + NEW + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@example.test\"}")).andExpect(status().isOk());
    }
}
