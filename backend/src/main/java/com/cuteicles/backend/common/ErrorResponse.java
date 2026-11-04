package com.cuteicles.backend.common;

import java.time.Instant;
import java.util.Map;

/**
 * Every error looks like this. The frontend reads "message" for the text and
 * "errors" (field -> message) for form fields.
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        Map<String, String> errors,
        String path
) {}
