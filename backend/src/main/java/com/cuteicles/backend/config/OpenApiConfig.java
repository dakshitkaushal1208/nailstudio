package com.cuteicles.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cuteIclesOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cute Icles API")
                        .version("1.0.0")
                        .description("Backend for Cute Icles by Mehak Dhiman: appointments, gallery, shop and admin."))
                .components(new Components()
                        .addSecuritySchemes("bearer", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT"))
                        .addSecuritySchemes("cookie", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("ci_session")))
                .addSecurityItem(new SecurityRequirement().addList("bearer"))
                .addSecurityItem(new SecurityRequirement().addList("cookie"));
    }
}
