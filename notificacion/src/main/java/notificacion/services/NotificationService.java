// src/main/java/notificacion/services/NotificationService.java
package notificacion.services;

import notificacion.dtos.NotificationDTO;
import notificacion.dtos.NotificationListResponse;
import notificacion.mappers.NotificationMapper;
import notificacion.models.Notification;
import notificacion.repositories.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications(Long userId, String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageData = ("unread".equalsIgnoreCase(status))
                ? repo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                : repo.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        var items = pageData.getContent().stream()
                .map(NotificationMapper::toDTO).toList();
        var unread = repo.countByUserIdAndIsReadFalse(userId);

        return new NotificationListResponse(unread, items);
    }

    @Transactional(readOnly = true)
    public int unreadCount(Long userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markRead(Long userId, UUID notifId, boolean isRead) {
        var n = repo.findById(notifId).orElseThrow();
        if (!n.getUserId().equals(userId)) throw new IllegalArgumentException("Usuario inválido");
        n.setRead(isRead);
        repo.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        // versión simple: paginar y marcar (evita update nativo si no querés)
        repo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, PageRequest.of(0, 500))
                .forEach(n -> { n.setRead(true); repo.save(n); });
    }

    // Helper para crear notificaciones desde el import del Excel
    @Transactional
    public NotificationDTO create(Notification n) {
        var saved = repo.save(n);
        return NotificationMapper.toDTO(saved);
    }
}
