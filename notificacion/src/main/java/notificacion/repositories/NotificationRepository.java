// src/main/java/notificacion/repositories/NotificationRepository.java
package notificacion.repositories;

import notificacion.models.Notification;
import notificacion.models.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.UUID;


public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    int countByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndTypeAndResourceIdAndCreatedAtBetween(
            Long userId, NotificationType type, String resourceId, Instant from, Instant to
    );
}

