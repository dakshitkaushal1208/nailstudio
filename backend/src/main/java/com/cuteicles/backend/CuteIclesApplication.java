package com.cuteicles.backend;

import com.cuteicles.backend.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
// Several repositories are declared as nested interfaces (OrderRepositories.OrderRepository, ...).
// Spring Data ignores nested interfaces unless this flag is set, which caused
// "No qualifying bean of type ...OrderRepository". Guarded by RepositoryWiringTest.
@EnableJpaRepositories(considerNestedRepositories = true)
public class CuteIclesApplication {

    public static void main(String[] args) {
        SpringApplication.run(CuteIclesApplication.class, args);
    }
}
