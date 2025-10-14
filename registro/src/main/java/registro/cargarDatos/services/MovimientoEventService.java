package registro.cargarDatos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import registro.cargarDatos.models.Movimiento;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@Service
public class MovimientoEventService {

    private final RestTemplate restTemplate;
    
    @Value("${notificacion.service.url:http://localhost:8084}")
    private String notificacionServiceUrl;

    public MovimientoEventService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendMovementCreatedEvent(Movimiento movimiento) {
        try {
            // Crear el evento
            Map<String, Object> event = new HashMap<>();
            event.put("userId", movimiento.getUsuarioId());
            event.put("refId", movimiento.getId().toString());
            event.put("date", movimiento.getFechaEmision().atStartOfDay().toInstant(ZoneOffset.UTC));
            event.put("amount", BigDecimal.valueOf(movimiento.getMontoTotal()));
            event.put("description", movimiento.getDescripcion());

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
