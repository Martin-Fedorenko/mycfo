package registro.cargarDatos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import registro.cargarDatos.models.Registro;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@Service
public class RegistroEventService {

    private final RestTemplate restTemplate;
    
    @Value("${notificacion.service.url:http://localhost:8084}")
    private String notificacionServiceUrl;

    public RegistroEventService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendMovementCreatedEvent(Registro registro) {
        try {
            // Crear el evento
            Map<String, Object> event = new HashMap<>();
            event.put("userId", registro.getUsuario());
            event.put("refId", registro.getId().toString());
            event.put("date", registro.getFechaEmision().atStartOfDay().toInstant(ZoneOffset.UTC));
            event.put("amount", BigDecimal.valueOf(registro.getMontoTotal()));
            event.put("description", registro.getDescripcion());

            // Enviar al servicio de notificaciones
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(event, headers);
            
            restTemplate.postForObject(
                notificacionServiceUrl + "/api/events/movements",
                request,
                Void.class
            );
            
        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println("Error enviando evento de movimiento: " + e.getMessage());
        }
    }
}
