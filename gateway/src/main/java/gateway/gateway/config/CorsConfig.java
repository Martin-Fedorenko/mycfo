package gateway.gateway.config;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class CorsConfig {

	@Bean
	@Order(Ordered.HIGHEST_PRECEDENCE)
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration config = new CorsConfiguration();
		
		// Solo permitir el frontend en localhost:3000
		config.setAllowedOriginPatterns(Collections.singletonList("http://localhost:3000"));
		
		// Métodos HTTP permitidos
		config.setAllowedMethods(Arrays.asList(
				HttpMethod.GET.name(),
				HttpMethod.POST.name(),
				HttpMethod.PUT.name(),
				HttpMethod.PATCH.name(),
				HttpMethod.DELETE.name(),
				HttpMethod.OPTIONS.name(),
				HttpMethod.HEAD.name()
		));
		
		// Headers permitidos - permitir todos los headers
		config.addAllowedHeader("*");
		
		// Headers expuestos en la respuesta
		config.setExposedHeaders(Arrays.asList(
				"X-Usuario-Sub",
				"Content-Type",
				"Content-Length"
		));
		
		// Permitir credenciales (cookies, headers de autenticación)
		config.setAllowCredentials(true);
		
		// Tiempo de caché para preflight requests (en segundos)
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		
		return new CorsWebFilter(source);
	}

	/**
	 * GlobalFilter que asegura que los headers CORS del gateway estén presentes.
	 * Este filtro se ejecuta DESPUÉS de que el backend responde.
	 * Elimina headers CORS del backend y agrega los del gateway.
	 */
	@Bean
	public GlobalFilter ensureCorsHeadersFilter() {
		return (ServerWebExchange exchange, GatewayFilterChain chain) -> {
			return chain.filter(exchange).then(Mono.fromRunnable(() -> {
				ServerHttpResponse response = exchange.getResponse();
				HttpHeaders headers = response.getHeaders();
				ServerHttpRequest request = exchange.getRequest();
				
				// Obtener el origen de la petición
				String origin = request.getHeaders().getFirst(HttpHeaders.ORIGIN);
				
				// Si hay un origen desde localhost:3000 (es una petición CORS del frontend)
				if (origin != null && origin.equals("http://localhost:3000")) {
					// Eliminar TODOS los headers CORS del backend primero
					headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
					headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
					headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
					headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
					headers.remove(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
					headers.remove(HttpHeaders.ACCESS_CONTROL_MAX_AGE);
					
					// Agregar headers CORS del gateway
					headers.setAccessControlAllowOrigin("http://localhost:3000");
					headers.setAccessControlAllowCredentials(true);
					headers.setAccessControlAllowMethods(Arrays.asList(
							HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT,
							HttpMethod.PATCH, HttpMethod.DELETE, HttpMethod.OPTIONS, HttpMethod.HEAD
					));
					headers.setAccessControlAllowHeaders(Arrays.asList("*"));
					headers.setAccessControlExposeHeaders(Arrays.asList("X-Usuario-Sub"));
					headers.setAccessControlMaxAge(3600L);
				}
			}));
		};
	}
}
