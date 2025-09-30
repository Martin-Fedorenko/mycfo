package notificacion.controllers;

import notificacion.services.EmailConfigurationService;
import notificacion.services.EmailNotificationService;
import notificacion.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email-config")
@CrossOrigin(origins = "*")
public class EmailConfigurationController {

    @Autowired
    private EmailConfigurationService emailConfigService;

    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("configured", emailConfigService.isEmailConfigured());
        response.put("status", emailConfigService.getConfigurationStatus());
        response.put("info", emailConfigService.getConfigurationInfo());
        response.put("host", emailConfigService.getHost());
        response.put("port", emailConfigService.getPort());
        response.put("username", emailConfigService.getUsername());
        response.put("fromEmail", emailConfigService.getFromEmail());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testEmailConfiguration(@RequestParam Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        if (!emailConfigService.isEmailConfigured()) {
            response.put("success", false);
            response.put("message", "Email no configurado. Configure las credenciales primero.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Obtener todas las notificaciones del usuario
            List<notificacion.models.Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.Pageable.unpaged()).getContent();
            
            if (notifications.isEmpty()) {
                response.put("success", false);
                response.put("message", "No hay notificaciones para enviar en el digest");
                return ResponseEntity.badRequest().body(response);
            }

            // Enviar digest con todas las notificaciones
            emailNotificationService.sendDailyDigest(userId, notifications);
            
            response.put("success", true);
            response.put("message", "Digest de prueba enviado exitosamente con " + notifications.size() + " notificaciones");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error enviando digest de prueba: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
