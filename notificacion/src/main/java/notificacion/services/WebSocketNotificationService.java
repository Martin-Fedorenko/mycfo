package notificacion.services;

import notificacion.dtos.NotificationDTO;
import notificacion.models.Notification;
import notificacion.models.NotificationType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotificationToUser(String usuarioId, NotificationDTO notification) {
        // Enviar notificacion especifica al usuario
        messagingTemplate.convertAndSendToUser(
            usuarioId,
            "/queue/notifications",
            notification
        );
    }

    public void sendNotificationToUser(String usuarioId, Notification notification) {
        // Convertir Notification a NotificationDTO y enviar
        NotificationDTO dto = convertToDTO(notification);
        sendNotificationToUser(usuarioId, dto);
    }

    public void sendUnreadCountUpdate(String usuarioId, int unreadCount) {
        // Enviar actualizacion del contador de no leidas
        messagingTemplate.convertAndSendToUser(
            usuarioId,
            "/queue/unread-count",
            Map.of("unreadCount", unreadCount)
        );
    }

    public void sendNotificationToAllUsers(NotificationDTO notification) {
        // Enviar notificacion a todos los usuarios conectados
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    public void sendSystemNotification(String message, NotificationType type) {
        // Enviar notificacion del sistema a todos los usuarios
        NotificationDTO systemNotification = new NotificationDTO(
            null, // ID sera generado
            "Sistema",
            message,
            type.name(),
            false,
            java.time.Instant.now(),
            "SYSTEM",
            null,
            null
        );
        
        sendNotificationToAllUsers(systemNotification);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
            notification.getId(),
            notification.getTitle(),
            notification.getBody(),
            notification.getType().name(),
            notification.isRead(),
            notification.getCreatedAt(),
            notification.getResourceType() != null ? notification.getResourceType().name() : null,
            notification.getResourceId(),
            notification.getActionUrl()
        );
    }
}
