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
            
            // Asegurar que el contexto tenga todos los datos necesarios
            System.out.println("Enviando email con título: " + notification.getTitle());
            System.out.println("Enviando email con cuerpo: " + notification.getBody());
            
            // Formatear números para evitar notación científica
            String formattedBody = notification.getBody();
            if (formattedBody != null) {
                formattedBody = formattedBody.replaceAll("\\$-?\\d+\\.\\d+E\\+\\d+", "Número grande");
                formattedBody = formattedBody.replaceAll("\\$-?\\d+E\\+\\d+", "Número grande");
            }
            context.setVariable("body", formattedBody);
            
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
            
            // Formatear números para evitar notación científica (sin modificar la BD)
            for (Notification notification : notifications) {
                // Formatear números para evitar notación científica
                String formattedBody = notification.getBody();
                if (formattedBody != null) {
                    // Detectar y reemplazar notación científica
                    formattedBody = formattedBody.replaceAll("\\$-?\\d+\\.\\d*E\\+\\d+", "Número grande");
                    formattedBody = formattedBody.replaceAll("\\$-?\\d+E\\+\\d+", "Número grande");
                }
                
                // NO modificar la notificación original, solo usar para el email
                // La fecha se mostrará correctamente desde el template
            }
            
            String htmlContent = templateEngine.process("digest-email", context);
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
            
            String htmlContent = templateEngine.process("digest-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Error enviando digest semanal: " + e.getMessage());
        }
    }


    private String getUserEmail(Long userId) {
        // Opción 1: Email configurable por usuario en las preferencias
        NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
        if (prefs != null && prefs.getUserEmail() != null && !prefs.getUserEmail().trim().isEmpty()) {
            System.out.println("Usando email personalizado del usuario " + userId + ": " + prefs.getUserEmail());
            return prefs.getUserEmail().trim();
        }
        
        // Opción 2: Email de prueba para desarrollo - usar el email configurado
        System.out.println("Usuario " + userId + " sin email personalizado, usando email de desarrollo");
        return "mycfoarg@gmail.com";
    }

    /**
     * Envía un email de recordatorio personalizado
     */
    @Transactional
    public void sendReminderEmail(Long userId, notificacion.models.CustomReminder reminder) {
        try {
            String userEmail = getUserEmail(userId);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(userEmail);
            helper.setSubject("MyCFO - Recordatorio: " + reminder.getTitle());
            helper.setFrom(fromEmail);
            
            // Crear contexto para Thymeleaf
            Context context = new Context(new Locale("es", "ES"));
            context.setVariable("reminder", reminder);
            
            String htmlContent = templateEngine.process("reminder-email", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("Email de recordatorio enviado a: " + userEmail);
            
        } catch (MessagingException e) {
            System.err.println("Error enviando email de recordatorio: " + e.getMessage());
        }
    }
}
