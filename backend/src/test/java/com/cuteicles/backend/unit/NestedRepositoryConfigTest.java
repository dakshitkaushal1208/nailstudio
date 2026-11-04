package com.cuteicles.backend.unit;

import com.cuteicles.backend.CuteIclesApplication;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Fast guard (no database): nested repository interfaces are only picked up when the flag is on. */
class NestedRepositoryConfigTest {

    @Test
    void nestedRepositoriesAreEnabledWheneverSomeExist() throws Exception {
        List<String> nested = new ArrayList<>();
        Path root = Path.of("target/classes/com/cuteicles/backend");
        try (Stream<Path> files = Files.walk(root)) {
            for (Path f : (Iterable<Path>) files.filter(p -> p.getFileName().toString().contains("$"))::iterator) {
                String rel = Path.of("target/classes").relativize(f).toString().replace('/', '.').replace('\\', '.');
                Class<?> c = Class.forName(rel.substring(0, rel.length() - ".class".length()));
                if (c.isInterface() && JpaRepository.class.isAssignableFrom(c)) {
                    nested.add(c.getName());
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Run after compilation (mvn test)", e);
        }
        if (!nested.isEmpty()) {
            EnableJpaRepositories cfg = CuteIclesApplication.class.getAnnotation(EnableJpaRepositories.class);
            assertTrue(cfg != null && cfg.considerNestedRepositories(),
                    "Nested repositories " + nested + " need @EnableJpaRepositories(considerNestedRepositories = true)");
        }
        assertTrue(nested.size() >= 1, "expected the nested *Repositories holders to be found");
    }
}
