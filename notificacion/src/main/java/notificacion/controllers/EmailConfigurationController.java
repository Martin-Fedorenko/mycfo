package notificacion.controllers;

import notificacion.services.EmailConfigurationService;
import notificacion.services.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email-config")
@CrossOrigin(origins = "*")
public class EmailConfigurationController {

    @Autowired
    private EmailConfigurationService emailConfigService;

    @Autowired
    private EmailNotificationService emailNotificationService;

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
            // Crear una notificación de prueba
            notificacion.models.Notification testNotification = new notificacion.models.Notification();
            testNotification.setTitle("Prueba de Configuración de Email");
            testNotification.setBody("Este es un email de prueba para verificar que la configuración de email funciona correctamente.");
            testNotification.setType(notificacion.models.NotificationType.REMINDER_CUSTOM);
            testNotification.setSeverity(notificacion.models.Severity.INFO);
            testNotification.setCreatedAt(java.time.Instant.now());

            // Enviar email de prueba
            emailNotificationService.sendNotificationEmail(userId, testNotification);
            
            response.put("success", true);
            response.put("message", "Email de prueba enviado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error enviando email de prueba: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
