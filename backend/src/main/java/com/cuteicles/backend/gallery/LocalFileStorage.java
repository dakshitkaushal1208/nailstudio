package com.cuteicles.backend.gallery;

import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.config.AppProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalFileStorage implements FileStorage {

    private static final String PREFIX = "/uploads/";

    private final Path root;
    private final long maxBytes;

    public LocalFileStorage(AppProperties props) {
        this.root = Path.of(props.upload().dir()).toAbsolutePath().normalize();
        this.maxBytes = props.upload().maxBytes();
    }

    @Override
    public String storeImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose an image to upload.");
        }
        if (file.getSize() > maxBytes) {
            throw ApiException.badRequest("That image is too large. The limit is " + (maxBytes / 1024 / 1024) + " MB.");
        }
        try (InputStream in = file.getInputStream()) {
            byte[] bytes = in.readNBytes((int) maxBytes + 1);
            if (bytes.length > maxBytes) {
                throw ApiException.badRequest("That image is too large. The limit is " + (maxBytes / 1024 / 1024) + " MB.");
            }
            String ext = ImageSniffer.detect(bytes);
            if (ext == null) {
                throw ApiException.badRequest("Only JPEG, PNG, WebP or GIF images can be uploaded.");
            }
            Path dir = root.resolve(folder).normalize();
            if (!dir.startsWith(root)) {
                throw ApiException.badRequest("Invalid upload folder.");
            }
            Files.createDirectories(dir);
            String name = UUID.randomUUID() + "." + ext; // server-chosen name: no path tricks from the client
            Files.copy(new java.io.ByteArrayInputStream(bytes), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            return PREFIX + folder + "/" + name;
        } catch (IOException e) {
            throw new IllegalStateException("Could not store the uploaded file.", e);
        }
    }

    @Override
    public void delete(String publicPath) {
        if (publicPath == null || !publicPath.startsWith(PREFIX)) {
            return;
        }
        Path p = root.resolve(publicPath.substring(PREFIX.length())).normalize();
        if (!p.startsWith(root)) {
            return;
        }
        try {
            Files.deleteIfExists(p);
        } catch (IOException ignored) {
            // an orphaned file is harmless; the database row is the source of truth
        }
    }
}
