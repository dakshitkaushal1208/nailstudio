package com.cuteicles.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;

/** Pure helpers for the 6-digit password-reset code. */
public final class ResetCode {

    public static final int LENGTH = 6;
    /** Wrong guesses allowed per code; after that the code is burned and a new one must be requested. */
    public static final int MAX_ATTEMPTS = 5;

    private ResetCode() {}

    public static String generate(SecureRandom random) {
        return String.format("%0" + LENGTH + "d", random.nextInt(1_000_000));
    }

    /** True only for exactly six ASCII digits. */
    public static boolean isWellFormed(String code) {
        if (code == null || code.length() != LENGTH) {
            return false;
        }
        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            if (c < '0' || c > '9') {
                return false;
            }
        }
        return true;
    }

    /** Constant-time comparison of two hex digests. */
    public static boolean sameHash(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
