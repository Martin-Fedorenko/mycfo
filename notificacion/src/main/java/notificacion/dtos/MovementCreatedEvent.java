package notificacion.dtos;

import java.math.BigDecimal;
import java.time.Instant;

public record MovementCreatedEvent(
        Long userId,          // opcional x ahora
        String refId,         // obligatorio para idempotencia
        Instant date,
        BigDecimal amount,    // >0 ingreso; <0 egreso
        String description
) {}
