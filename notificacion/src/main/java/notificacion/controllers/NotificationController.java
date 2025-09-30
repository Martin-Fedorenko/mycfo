// src/main/java/notificacion/controllers/NotificationController.java
package notificacion.controllers;

import notificacion.dtos.MarkReadRequest;
import notificacion.dtos.NotificationListResponse;
import notificacion.models.NotificationType;
import notificacion.models.Severity;
import notificacion.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/users/{userId}/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<NotificationListResponse> list(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.getNotifications(userId, status, page, size));
    }

    @GetMapping("/unreadCount")
    public ResponseEntity<?> unreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(java.util.Map.of("unread", service.unreadCount(userId)));
    }

    @PatchMapping("/{notifId}")
    public ResponseEntity<?> markRead(
            @PathVariable Long userId,
            @PathVariable Long notifId,
            @RequestBody MarkReadRequest body
    ) {
        service.markRead(userId, notifId, body.is_read());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(":markAllRead")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        service.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<NotificationListResponse> getByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.getNotificationsByType(userId, type, page, size));
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<NotificationListResponse> getBySeverity(
            @PathVariable Long userId,
            @PathVariable Severity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.getNotificationsBySeverity(userId, severity, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<NotificationListResponse> search(
            @PathVariable Long userId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.searchNotifications(userId, q, page, size));
    }

    @DeleteMapping("/{notifId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long userId,
            @PathVariable Long notifId
    ) {
        service.deleteNotification(notifId, userId);
        return ResponseEntity.noContent().build();
    }
}

