// src/main/java/notificacion/services/NotificationService.java
package notificacion.services;

import notificacion.dtos.NotificationDTO;
import notificacion.dtos.NotificationListResponse;
import notificacion.mappers.NotificationMapper;
import notificacion.models.Notification;
import notificacion.models.NotificationType;
import notificacion.models.Severity;
import notificacion.repositories.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository repo;
    private final WebSocketNotificationService webSocketService;
    private final EmailNotificationService emailService;
    private final NotificationPreferencesService preferencesService;

    public NotificationService(NotificationRepository repo,
                             WebSocketNotificationService webSocketService,
                             EmailNotificationService emailService,
                             NotificationPreferencesService preferencesService) {
        this.repo = repo;
        this.webSocketService = webSocketService;
        this.emailService = emailService;
        this.preferencesService = preferencesService;
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
        
        // Enviar notificación en tiempo real
        webSocketService.sendNotificationToUser(n.getUserId(), saved);
        
        // Enviar email si está habilitado
        if (preferencesService.isEmailEnabled(n.getUserId(), n.getType())) {
            emailService.sendNotificationEmail(n.getUserId(), saved);
        }
        
        // Actualizar contador de no leídas
        int unreadCount = repo.countByUserIdAndIsReadFalse(n.getUserId());
        webSocketService.sendUnreadCountUpdate(n.getUserId(), unreadCount);
        
        return NotificationMapper.toDTO(saved);
    }

    // Métodos avanzados para filtros
    @Transactional(readOnly = true)
    public NotificationListResponse getNotificationsByType(Long userId, NotificationType type, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageData = repo.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
        
        var items = pageData.getContent().stream()
                .map(NotificationMapper::toDTO).toList();
        var unread = repo.countByUserIdAndIsReadFalse(userId);
        
        return new NotificationListResponse(unread, items);
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getNotificationsBySeverity(Long userId, Severity severity, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageData = repo.findByUserIdAndSeverityOrderByCreatedAtDesc(userId, severity, pageable);
        
        var items = pageData.getContent().stream()
                .map(NotificationMapper::toDTO).toList();
        var unread = repo.countByUserIdAndIsReadFalse(userId);
        
        return new NotificationListResponse(unread, items);
    }

    @Transactional(readOnly = true)
    public NotificationListResponse searchNotifications(Long userId, String searchTerm, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageData = repo.findByUserIdAndSearchTerm(userId, searchTerm, pageable);
        
        var items = pageData.getContent().stream()
                .map(NotificationMapper::toDTO).toList();
        var unread = repo.countByUserIdAndIsReadFalse(userId);
        
        return new NotificationListResponse(unread, items);
    }

    @Transactional
    public void deleteNotification(UUID notificationId, Long userId) {
        var notification = repo.findById(notificationId).orElseThrow();
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para eliminar esta notificación");
        }
        repo.delete(notification);
        
        // Actualizar contador de no leídas
        int unreadCount = repo.countByUserIdAndIsReadFalse(userId);
        webSocketService.sendUnreadCountUpdate(userId, unreadCount);
    }
}
