package notificacion.services;

import notificacion.dtos.MovementCreatedEvent;
import notificacion.models.*;
import notificacion.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Service
public class EventService {

    private final NotificationRepository repo;

    @Value("${notifications.default-user-id:1}")
    private Long defaultUserId;

    @Value("${notifications.high-threshold:100000}")
    private BigDecimal highThreshold;

    public EventService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void handleMovementCreated(MovementCreatedEvent evt) {
        // 0) Normalizar datos
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final String refId = Objects.requireNonNull(evt.refId(), "refId es obligatorio");
        final Instant createdAt = evt.date() != null ? evt.date() : Instant.now();
        final boolean isIncome = evt.amount() != null && evt.amount().signum() >= 0;

        // 1) Siempre: MOVEMENT_NEW (idempotente por (user,type,resourceId,día))
        saveIfNew(userId, NotificationType.MOVEMENT_NEW, refId,
                isIncome ? "Ingreso detectado" : "Egreso registrado",
                body(evt),
                Severity.INFO, createdAt);

        // 2) Umbral alto
        if (evt.amount() != null && evt.amount().abs().compareTo(highThreshold) >= 0) {
            saveIfNew(userId, NotificationType.MOVEMENT_HIGH, refId,
                    "Movimiento alto detectado", body(evt),
                    Severity.WARN, createdAt);
        }

        // 3) (opcional v2) Duplicado por monto+descripcion en ventana — lo dejamos para luego
    }

    private String body(MovementCreatedEvent e) {
        String desc = e.description() != null ? e.description() + " – " : "";
        return desc + "$" + (e.amount() != null ? e.amount() : "0");
    }

    private void saveIfNew(Long userId, NotificationType type, String resourceId,
                           String title, String body, Severity sev, Instant createdAt) {
        Instant start = createdAt.truncatedTo(ChronoUnit.DAYS);
        Instant end = start.plus(1, ChronoUnit.DAYS);

        boolean exists = repo.existsByUserIdAndTypeAndResourceIdAndCreatedAtBetween(
                userId, type, resourceId, start, end
        );
        if (exists) return;

        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setSeverity(sev);
        n.setResourceType(ResourceType.MOVEMENT);
        n.setResourceId(resourceId);
        n.setCreatedAt(createdAt);
        repo.save(n);
    }
}

