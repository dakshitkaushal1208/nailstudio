package com.cuteicles.backend.common;

import java.text.Normalizer;
import java.util.Locale;

public final class Texts {

    private Texts() {}

    public static String slugify(String input) {
        if (input == null) {
            return "";
        }
        String n = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        String s = n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-+|-+$)", "");
        return s.length() > 120 ? s.substring(0, 120).replaceAll("-+$", "") : s;
    }

    public static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    public static String orEmpty(String s) {
        return s == null ? "" : s;
    }

    /** Strips spaces, dashes and brackets from a phone number. */
    public static String compactPhone(String s) {
        return s == null ? "" : s.replaceAll("[\\s()-]", "");
    }

    /** Parses a path id such as "12". Returns null when it is not a number. */
    public static Long parseId(String s) {
        if (s == null) {
            return null;
        }
        try {
            return Long.parseLong(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static String idOf(Long id) {
        return id == null ? null : String.valueOf(id);
    }
}
