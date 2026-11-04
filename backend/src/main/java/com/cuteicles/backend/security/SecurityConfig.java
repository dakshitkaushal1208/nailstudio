package com.cuteicles.backend.security;

import com.cuteicles.backend.auth.AuthSessionRepository;
import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.users.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.List;

/**
 * Stateless, deny-by-default. Public endpoints are listed explicitly; everything else needs a signed-in
 * user, and /api/admin/** (plus gallery writes) needs the ADMIN role, checked on the server.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(11);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(props.cors().allowedOrigins());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Content-Type", "Accept", "Authorization", "X-Requested-With", "Idempotency-Key"));
        cfg.setExposedHeaders(List.of("Retry-After"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AppProperties props, JwtService jwtService,
                                           AuthSessionRepository sessions, UserRepository users,
                                           ObjectMapper mapper,@Qualifier("corsConfigurationSource") CorsConfigurationSource cors) throws Exception {     
                                                   http
                // Cookie auth is protected by SameSite=Lax and OriginCheckFilter instead of CSRF tokens.
                .csrf(csrf -> csrf.disable())
                .cors(c -> c.configurationSource(cors))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) ->
                                JsonErrors.write(mapper, req, res, HttpStatus.UNAUTHORIZED, "Please sign in to continue."))
                        .accessDeniedHandler((req, res, ex) ->
                                JsonErrors.write(mapper, req, res, HttpStatus.FORBIDDEN, "You do not have permission to do that.")))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register", "/api/auth/login", "/api/auth/logout",
                                "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/settings", "/api/services", "/api/services/**",
                                "/api/availability/days", "/api/availability/slots",
                                "/api/gallery", "/api/gallery/**",
                                "/api/products", "/api/products/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Compatibility routes the current frontend uses for gallery management.
                        .requestMatchers("/api/gallery", "/api/gallery/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(new RateLimitFilter(props, mapper), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new OriginCheckFilter(props, mapper), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtCookieAuthenticationFilter(props, jwtService, sessions, users),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
