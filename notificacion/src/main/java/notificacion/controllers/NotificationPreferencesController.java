package notificacion.controllers;

import notificacion.models.NotificationPreferences;
import notificacion.models.NotificationType;
import notificacion.services.NotificationPreferencesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/notification-preferences")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationPreferencesController {

    private final NotificationPreferencesService preferencesService;

    public NotificationPreferencesController(NotificationPreferencesService preferencesService) {
        this.preferencesService = preferencesService;
    }

    @GetMapping
    public ResponseEntity<NotificationPreferences> getPreferences(@PathVariable Long userId) {
        return preferencesService.getPreferences(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<NotificationPreferences> updatePreferences(
            @PathVariable Long userId,
            @RequestBody NotificationPreferences preferences) {
        NotificationPreferences updated = preferencesService.updatePreferences(userId, preferences);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/type/{type}")
    public ResponseEntity<Void> updateTypePreference(
            @PathVariable Long userId,
            @PathVariable NotificationType type,
            @RequestBody Map<String, Boolean> preferences) {
        
        boolean enabled = preferences.getOrDefault("enabled", true);
        boolean emailEnabled = preferences.getOrDefault("emailEnabled", true);
        boolean inAppEnabled = preferences.getOrDefault("inAppEnabled", true);
        
        preferencesService.updateTypePreference(userId, type, enabled, emailEnabled, inAppEnabled);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/enabled/{type}")
    public ResponseEntity<Map<String, Boolean>> isNotificationEnabled(
            @PathVariable Long userId,
            @PathVariable NotificationType type) {
        
        boolean enabled = preferencesService.isNotificationEnabled(userId, type);
        boolean emailEnabled = preferencesService.isEmailEnabled(userId, type);
        boolean inAppEnabled = preferencesService.isInAppEnabled(userId, type);
        boolean inQuietHours = preferencesService.isInQuietHours(userId);
        
        return ResponseEntity.ok(Map.of(
            "enabled", enabled,
            "emailEnabled", emailEnabled,
            "inAppEnabled", inAppEnabled,
            "inQuietHours", inQuietHours
        ));
    }
}
