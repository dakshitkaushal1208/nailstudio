package com.cuteicles.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    public static boolean isStrong(String pw) {
        if (pw == null || pw.length() < 8 || pw.length() > 72) {
            return false;
        }
        boolean letter = false;
        boolean digit = false;
        for (char c : pw.toCharArray()) {
            if (Character.isLetter(c)) {
                letter = true;
            } else if (Character.isDigit(c)) {
                digit = true;
            }
        }
        return letter && digit;
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null is left to @NotBlank so each field reports one clear message.
        return value == null || isStrong(value);
    }
}
