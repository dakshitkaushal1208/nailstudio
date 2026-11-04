package com.cuteicles.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** A 10-digit Indian mobile number, optionally prefixed with +91, 91 or 0. Blank is allowed; combine with @NotBlank if required. */
@Documented
@Constraint(validatedBy = IndianPhoneValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface IndianPhone {
    String message() default "Enter a valid 10-digit mobile number.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
