package com.cuteicles.backend.common;

import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** A failure that should reach the client as a clean JSON error. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final Map<String, String> errors;

    public ApiException(HttpStatus status, String message) {
        this(status, message, Collections.emptyMap());
    }

    public ApiException(HttpStatus status, String message, Map<String, String> errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    public HttpStatus status() {
        return status;
    }

    public Map<String, String> errors() {
        return errors;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException invalid(String message, Map<String, String> errors) {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, message, errors);
    }

    public static ApiException invalid(String field, String fieldMessage) {
        Map<String, String> errors = new LinkedHashMap<>();
        errors.put(field, fieldMessage);
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Please fix the highlighted fields.", errors);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }
}
