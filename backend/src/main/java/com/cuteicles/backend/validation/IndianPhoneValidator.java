package com.cuteicles.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class IndianPhoneValidator implements ConstraintValidator<IndianPhone, String> {

    private static final Pattern PHONE = Pattern.compile("^(?:\\+?91|0)?[6-9]\\d{9}$");

    public static boolean isValid(String value) {
        if (value == null) {
            return false;
        }
        return PHONE.matcher(value.replaceAll("[\\s()-]", "")).matches();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        return isValid(value);
    }
}
