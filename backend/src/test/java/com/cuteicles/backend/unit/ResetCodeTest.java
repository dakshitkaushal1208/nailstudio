package com.cuteicles.backend.unit;

import com.cuteicles.backend.auth.ResetCode;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResetCodeTest {

    @Test
    void generatedCodesAreSixDigitsAndVary() {
        SecureRandom r = new SecureRandom();
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 200; i++) {
            String c = ResetCode.generate(r);
            assertEquals(6, c.length());
            assertTrue(ResetCode.isWellFormed(c), c);
            seen.add(c);
        }
        assertTrue(seen.size() > 150);
    }

    @Test
    void malformedCodesAreRejected() {
        for (String bad : new String[] {null, "", "12345", "1234567", "12345a", " 12345", "١٢٣٤٥٦", "12 456"}) {
            assertFalse(ResetCode.isWellFormed(bad), String.valueOf(bad));
        }
    }

    @Test
    void hashComparisonIsExact() {
        assertTrue(ResetCode.sameHash("abc", "abc"));
        assertFalse(ResetCode.sameHash("abc", "abd"));
        assertFalse(ResetCode.sameHash("abc", "abcd"));
    }

    @Test
    void attemptLimitIsFive() {
        assertEquals(5, ResetCode.MAX_ATTEMPTS);
    }
}
