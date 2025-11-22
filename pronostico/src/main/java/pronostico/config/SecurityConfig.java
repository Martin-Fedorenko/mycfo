package pronostico.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ❌ CORS eliminado (lo maneja el Gateway)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt())  // JWT
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()  // Permitir health checks
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.disable());  // CSRF desactivado para APIs REST

        return http.build();
    }
}
