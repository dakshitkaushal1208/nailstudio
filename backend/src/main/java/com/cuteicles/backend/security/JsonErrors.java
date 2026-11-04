package com.cuteicles.backend.security;

import com.cuteicles.backend.common.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

/** Writes the standard error body from filters, where @RestControllerAdvice does not apply. */
public final class JsonErrors {

    private JsonErrors() {}

    public static void write(ObjectMapper mapper, HttpServletRequest req, HttpServletResponse res,
                             HttpStatus status, String message) throws IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        ErrorResponse body = new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(),
                message, Map.of(), req.getRequestURI());
        mapper.writeValue(res.getOutputStream(), body);
    }
}
