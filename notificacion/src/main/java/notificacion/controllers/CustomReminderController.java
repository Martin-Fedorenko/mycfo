package notificacion.controllers;

import notificacion.models.CustomReminder;
import notificacion.services.CustomReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/reminders")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CustomReminderController {

    private final CustomReminderService reminderService;

    public CustomReminderController(CustomReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    public ResponseEntity<List<CustomReminder>> getUserReminders(@PathVariable Long userId) {
        List<CustomReminder> reminders = reminderService.getUserReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    @PostMapping
    public ResponseEntity<CustomReminder> createReminder(
            @PathVariable Long userId,
            @RequestBody CreateReminderRequest request) {
        
        CustomReminder reminder = reminderService.createReminder(
            userId,
            request.title(),
            request.message(),
            request.scheduledFor(),
            request.isRecurring(),
            request.recurrencePattern()
        );
        
        return ResponseEntity.ok(reminder);
    }

    @GetMapping("/{reminderId}")
    public ResponseEntity<CustomReminder> getReminder(
            @PathVariable Long userId,
            @PathVariable Long reminderId) {
        
        CustomReminder reminder = reminderService.getReminder(reminderId, userId);
        return ResponseEntity.ok(reminder);
    }

    @PutMapping("/{reminderId}")
    public ResponseEntity<CustomReminder> updateReminder(
            @PathVariable Long userId,
            @PathVariable Long reminderId,
            @RequestBody UpdateReminderRequest request) {
        
        reminderService.updateReminder(
            reminderId,
            userId,
            request.title(),
            request.message(),
            request.scheduledFor(),
            request.isRecurring(),
            request.recurrencePattern()
        );
        
        CustomReminder updated = reminderService.getReminder(reminderId, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable Long userId,
            @PathVariable Long reminderId) {
        
        reminderService.deleteReminder(reminderId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/debug")
    public ResponseEntity<String> debugReminders(@PathVariable Long userId) {
        try {
            reminderService.debugReminders(userId);
            return ResponseEntity.ok("Debug ejecutado - revisar logs del backend");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en debug: " + e.getMessage());
        }
    }

    // DTOs para requests
    public record CreateReminderRequest(
        String title,
        String message,
        Instant scheduledFor,
        boolean isRecurring,
        CustomReminder.RecurrencePattern recurrencePattern
    ) {}

    public record UpdateReminderRequest(
        String title,
        String message,
        Instant scheduledFor,
        boolean isRecurring,
        CustomReminder.RecurrencePattern recurrencePattern
    ) {}
}
