package notificacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir orígenes específicos
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "https://*.ngrok-free.app",
                "http://*.ngrok-free.app",
                "https://*.tunnelmole.net",
                "http://*.tunnelmole.net"
        ));
        
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        
        config.setAllowedHeaders(Arrays.asList("*"));
        // No configurar AllowCredentials - el gateway lo maneja
        config.setExposedHeaders(Arrays.asList("Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
