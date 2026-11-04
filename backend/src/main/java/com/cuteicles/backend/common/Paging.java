package com.cuteicles.backend.common;

import java.util.List;

/** In-memory paging for small collections. Plain arrays unless the caller passes ?page, which keeps the current frontend working. */
public final class Paging {

    private Paging() {}

    public static Object apply(List<?> all, Integer page, Integer size) {
        if (page == null) {
            return all;
        }
        int s = size == null ? 20 : Math.max(1, Math.min(size, 100));
        int p = Math.max(0, page);
        int from = (int) Math.min((long) p * s, all.size());
        int to = Math.min(from + s, all.size());
        int pages = (all.size() + s - 1) / s;
        return new PageResponse<Object>(List.copyOf(all.subList(from, to)), p, s, all.size(), pages);
    }
}
