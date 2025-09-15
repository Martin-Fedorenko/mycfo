package consolidacion.movimientosexcel.services;

import consolidacion.movimientosexcel.dtos.MovementEventPayload;
import consolidacion.movimientosexcel.models.MovimientoBancario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;

@Service
public class NotificationsEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NotificationsEventPublisher.class);

    private final RestTemplate rest;
    private final String baseUrl; // ej.: http://localhost:8084

    public NotificationsEventPublisher(
            RestTemplate rest,
            @Value("${notifications.url:http://localhost:8084}") String baseUrl) {
        this.rest = rest;
        this.baseUrl = baseUrl.replaceAll("/+$", ""); // sin slash final
    }

    public void publishMovement(MovimientoBancario m, Long fallbackUserId) {
        String refId = m.getIdReferencia() != null ? m.getIdReferencia()
                : String.valueOf(m.getId());

        MovementEventPayload payload = new MovementEventPayload(
                fallbackUserId != null ? fallbackUserId : 1L,
                refId,
                toInstant(m),                                   // LocalDate → Instant
                Double.valueOf(m.getMonto()),               // Double → BigDecimal
                m.getDescripcion()
        );

        String url = baseUrl + "/api/events/movements";
        try {
            rest.postForEntity(url, payload, Void.class);
        } catch (Exception e) {
            // No frenamos la carga del Excel si el micro de notificaciones está caído
            log.warn("No se pudo publicar evento a Notificaciones [{}]: {}", url, e.getMessage());
        }
    }

    private Instant toInstant(MovimientoBancario m) {
        // Tu fecha es LocalDate según el código
        return m.getFecha()
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();
    }
}

