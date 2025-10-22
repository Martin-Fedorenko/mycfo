// src/main/java/notificacion/repositories/NotificationRepository.java
package notificacion.repositories;

import notificacion.models.Notification;
import notificacion.models.NotificationType;
import notificacion.models.ResourceType;
import notificacion.models.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    int countByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndTypeAndResourceIdAndCreatedAtBetween(
            Long userId, NotificationType type, String resourceId, Instant from, Instant to
    );

    // Métodos para digest
    @Query("SELECT DISTINCT n.userId FROM Notification n WHERE n.createdAt BETWEEN :start AND :end")
    List<Long> findDistinctUserIdsByCreatedAtBetween(@Param("start") Instant start, @Param("end") Instant end);

    List<Notification> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, Instant start, Instant end);

    // Métodos para filtros avanzados
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type, Pageable pageable);

    Page<Notification> findByUserIdAndSeverityOrderByCreatedAtDesc(Long userId, Severity severity, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(n.body) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndSearchTerm(@Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    boolean existsByUserIdAndTypeAndResourceTypeAndResourceIdAndCreatedAtAfter(
            Long userId,
            NotificationType type,
            ResourceType resourceType,
            String resourceId,
            Instant createdAt);
}

