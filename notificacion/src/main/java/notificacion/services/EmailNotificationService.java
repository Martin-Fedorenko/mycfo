package notificacion.services;

import notificacion.dtos.NotificationDTO;
import notificacion.models.Notification;
import notificacion.models.NotificationPreferences;
import notificacion.models.NotificationType;
import notificacion.models.Severity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final NotificationPreferencesService preferencesService;
    private final TemplateEngine templateEngine;

    @Value("${notifications.email.from}")
    private String fromEmail;

    public EmailNotificationService(JavaMailSender mailSender, 
                                  NotificationPreferencesService preferencesService,
                                  TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.preferencesService = preferencesService;
        this.templateEngine = templateEngine;
    }

    @Transactional
    public void sendNotificationEmail(Long userId, Notification notification) {
        // Verificar si el usuario tiene email habilitado para este tipo
        if (!preferencesService.isEmailEnabled(userId, notification.getType())) {
            return;
        }

        // Verificar si está en horario de silencio
        if (preferencesService.isInQuietHours(userId)) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(getUserEmail(userId));
            helper.setSubject("MyCFO - " + notification.getTitle());
            
            // Usar template de Thymeleaf
            Context context = new Context(new Locale("es", "ES"));
            context.setVariable("title", notification.getTitle());
            context.setVariable("body", notification.getBody());
            context.setVariable("date", notification.getCreatedAt().toString());
            context.setVariable("severity", notification.getSeverity().name().toLowerCase());
            context.setVariable("notification", notification);
            
            String htmlContent = templateEngine.process("notification-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            // Log error
            System.err.println("Error enviando email: " + e.getMessage());
        }
    }

    @Transactional
    public void sendDailyDigest(Long userId, List<Notification> notifications) {
        NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
        if (prefs == null || !prefs.isDailyDigestEnabled()) {
            return;
        }

        if (notifications.isEmpty()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(getUserEmail(userId));
            helper.setSubject("MyCFO - Resumen Diario de Notificaciones");
            
            // Usar template de Thymeleaf
            Context context = new Context(new Locale("es", "ES"));
            context.setVariable("notifications", notifications);
            context.setVariable("digestType", "Diario");
            context.setVariable("date", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            
            String htmlContent = templateEngine.process("notification-digest-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Error enviando digest diario: " + e.getMessage());
        }
    }

    @Transactional
    public void sendWeeklyDigest(Long userId, List<Notification> notifications) {
        NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
        if (prefs == null || !prefs.isWeeklyDigestEnabled()) {
            return;
        }

        if (notifications.isEmpty()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(getUserEmail(userId));
            helper.setSubject("MyCFO - Resumen Semanal de Notificaciones");
            
            // Usar template de Thymeleaf
            Context context = new Context(new Locale("es", "ES"));
            context.setVariable("notifications", notifications);
            context.setVariable("digestType", "Semanal");
            context.setVariable("date", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            
            String htmlContent = templateEngine.process("notification-digest-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Error enviando digest semanal: " + e.getMessage());
        }
    }


    private String getUserEmail(Long userId) {
        // TODO: Implementar obtención del email del usuario desde el módulo de administración
        // Por ahora retornamos un email configurable o de prueba
        
        // Opción 1: Email configurable por usuario en las preferencias
        NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
        if (prefs != null && prefs.getUserEmail() != null && !prefs.getUserEmail().isEmpty()) {
            return prefs.getUserEmail();
        }
        
        // Opción 2: Email de prueba para desarrollo
        return "usuario" + userId + "@mycfo.com";
    }
}
