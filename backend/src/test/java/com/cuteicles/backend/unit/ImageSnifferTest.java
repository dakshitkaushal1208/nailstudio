package com.cuteicles.backend.unit;

import com.cuteicles.backend.gallery.ImageSniffer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ImageSnifferTest {

    private static byte[] bytes(int... v) {
        byte[] b = new byte[16];
        for (int i = 0; i < v.length; i++) b[i] = (byte) v[i];
        return b;
    }

    @Test
    void acceptsRealImageSignatures() {
        assertEquals("jpg", ImageSniffer.detect(bytes(0xFF, 0xD8, 0xFF, 0xE0)));
        assertEquals("png", ImageSniffer.detect(bytes(0x89, 'P', 'N', 'G', 13, 10, 26, 10)));
        assertEquals("webp", ImageSniffer.detect(bytes('R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P')));
    }

    @Test
    void rejectsScriptsAndSvgWhateverTheFileNameSays() {
        assertNull(ImageSniffer.detect(bytes('<', 's', 'v', 'g')));
        assertNull(ImageSniffer.detect(bytes('<', '?', 'p', 'h', 'p')));
        assertNull(ImageSniffer.detect(null));
    }
}
