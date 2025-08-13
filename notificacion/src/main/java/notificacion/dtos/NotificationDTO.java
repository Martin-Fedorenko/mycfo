// src/main/java/notificacion/dtos/NotificationDTO.java
package notificacion.dtos;

import java.time.Instant;
import java.util.UUID;

public record NotificationDTO(
        UUID id,
        String title,
        String body,
        String badge,      // etiqueta para UI
        boolean is_read,
        Instant date,
        String resource_type,
        String resource_id
) {}
