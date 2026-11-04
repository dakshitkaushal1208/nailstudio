package com.cuteicles.backend.common;

public final class Urls {

    private Urls() {}

    /** Own uploads, bundled assets, or https images. Blocks javascript:, data:, http: and path tricks. */
    public static String safeImage(String raw, String field) {
        String u = Texts.trim(raw);
        boolean local = (u.startsWith("/uploads/") || u.startsWith("/assets/")) && !u.contains("..") && !u.contains("\\");
        if (!local && !u.startsWith("https://")) {
            throw ApiException.invalid(field, "Use an uploaded image or an https:// address.");
        }
        return u;
    }
}
