package com.cuteicles.backend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests on H2 (MySQL mode) with the real Flyway migrations and dev seed.
 * NOT YET RUN: Maven Central was unreachable in the environment this was written in.
 * Run with: mvn verify   (PowerShell: .\mvnw.cmd verify, or mvn verify)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiFlowIT {

    @Autowired MockMvc mvc;

    private static final String REGISTER = """
            {"name":"Test User","email":"%s","phone":"9876543210","password":"Str0ng!Passw0rd"}""";

    @Test
    void publicCatalogueIsReadableWithoutLogin() throws Exception {
        mvc.perform(get("/api/services")).andExpect(status().isOk());
        mvc.perform(get("/api/products")).andExpect(status().isOk());
        mvc.perform(get("/api/settings")).andExpect(status().isOk());
    }

    @Test
    void protectedRoutesRejectAnonymousCallers() throws Exception {
        mvc.perform(get("/api/appointments/my")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/orders/my")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/cart")).andExpect(status().isUnauthorized());
    }

    @Test
    void adminRoutesRejectAnonymousAndCustomerCallers() throws Exception {
        mvc.perform(get("/api/admin/overview")).andExpect(status().isUnauthorized());
        var res = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(REGISTER.formatted("customer1@example.test"))).andExpect(status().is2xxSuccessful()).andReturn();
        var cookie = res.getResponse().getCookie("ci_session");
        mvc.perform(get("/api/admin/overview").cookie(cookie)).andExpect(status().isForbidden());
        mvc.perform(post("/api/gallery").cookie(cookie).contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\",\"imageUrl\":\"https://example.test/a.jpg\"}")).andExpect(status().isForbidden());
    }

    @Test
    void weakPasswordsAreRejected() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(REGISTER.formatted("weak@example.test").replace("Str0ng!Passw0rd", "password")))
                .andExpect(status().isUnprocessableEntity());
    }
}
