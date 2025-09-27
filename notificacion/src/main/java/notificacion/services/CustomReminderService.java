package notificacion.services;

import notificacion.models.CustomReminder;
import notificacion.models.Notification;
import notificacion.models.NotificationType;
import notificacion.models.Severity;
import notificacion.repositories.CustomReminderRepository;
import notificacion.repositories.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class CustomReminderService {

    private final CustomReminderRepository reminderRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailService;

    public CustomReminderService(CustomReminderRepository reminderRepository,
                               NotificationRepository notificationRepository,
                               NotificationService notificationService,
                               EmailNotificationService emailService) {
        this.reminderRepository = reminderRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public CustomReminder createReminder(Long userId, String title, String message, 
                                       Instant scheduledFor, boolean isRecurring, 
                                       CustomReminder.RecurrencePattern pattern) {
        CustomReminder reminder = new CustomReminder();
        reminder.setUserId(userId);
        reminder.setTitle(title);
        reminder.setMessage(message);
        reminder.setScheduledFor(scheduledFor);
        reminder.setRecurring(isRecurring);
        reminder.setRecurrencePattern(pattern);
        reminder.setActive(true);
        
        if (isRecurring) {
            reminder.initializeNextTrigger();
        }
        
        return reminderRepository.save(reminder);
    }

    @Transactional(readOnly = true)
    public List<CustomReminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserIdAndIsActiveTrueOrderByScheduledForAsc(userId);
    }
    
    // Método para debuggear recordatorios
    @Transactional(readOnly = true)
    public void debugReminders(Long userId) {
        List<CustomReminder> allReminders = reminderRepository.findByUserIdAndIsActiveTrue(userId);
        System.out.println("=== DEBUG RECORDATORIOS PARA USUARIO " + userId + " ===");
        for (CustomReminder reminder : allReminders) {
            System.out.println("ID: " + reminder.getId() + 
                             " | Título: " + reminder.getTitle() + 
                             " | Recurrente: " + reminder.isRecurring() + 
                             " | Patrón: " + reminder.getRecurrencePattern() + 
                             " | Programado: " + reminder.getScheduledFor() + 
                             " | Próximo: " + reminder.getNextTrigger() + 
                             " | Último: " + reminder.getLastTriggered());
        }
        System.out.println("=== FIN DEBUG ===");
    }

    @Transactional
    public void deleteReminder(Long reminderId, Long userId) {
        CustomReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new IllegalArgumentException("Recordatorio no encontrado"));
        
        if (!reminder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para eliminar este recordatorio");
        }
        
        reminder.setActive(false);
        reminderRepository.save(reminder);
    }

    @Transactional
    public void updateReminder(Long reminderId, Long userId, String title, String message, 
                             Instant scheduledFor, boolean isRecurring, 
                             CustomReminder.RecurrencePattern pattern) {
        CustomReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new IllegalArgumentException("Recordatorio no encontrado"));
        
        if (!reminder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para modificar este recordatorio");
        }
        
        reminder.setTitle(title);
        reminder.setMessage(message);
        reminder.setScheduledFor(scheduledFor);
        reminder.setRecurring(isRecurring);
        reminder.setRecurrencePattern(pattern);
        
        if (isRecurring) {
            reminder.calculateNextTrigger();
        } else {
            reminder.setNextTrigger(null);
        }
        
        reminderRepository.save(reminder);
    }

    // Ejecutar cada minuto para verificar recordatorios pendientes
    @Scheduled(fixedRate = 60000) // 60 segundos
    @Transactional
    public void processDueReminders() {
        Instant now = Instant.now();
        
        // Debug: mostrar todos los recordatorios activos del usuario 1
        debugReminders(1L);
        
        // Procesar recordatorios únicos (se ejecutan una sola vez)
        List<CustomReminder> dueReminders = reminderRepository.findDueReminders(now);
        System.out.println("Procesando " + dueReminders.size() + " recordatorios únicos");
        for (CustomReminder reminder : dueReminders) {
            createNotificationFromReminder(reminder);
            reminder.setActive(false); // ✅ Marcar como completado (se borra del frontend)
            reminderRepository.save(reminder);
            System.out.println("Recordatorio único ejecutado y desactivado: " + reminder.getTitle());
        }
        
        // Procesar recordatorios recurrentes (se repiten)
        List<CustomReminder> recurringReminders = reminderRepository.findRecurringReminders(now);
        System.out.println("Procesando " + recurringReminders.size() + " recordatorios recurrentes");
        for (CustomReminder reminder : recurringReminders) {
            createNotificationFromReminder(reminder);
            
            // Marcar como ejecutado y calcular próximo trigger
            reminder.markAsTriggered();
            
            // Verificar que el próximo trigger sea válido
            if (reminder.getNextTrigger() == null) {
                System.err.println("ERROR: nextTrigger es null para recordatorio recurrente: " + reminder.getTitle());
                reminder.setActive(false); // Desactivar si hay error
            } else {
                System.out.println("Recordatorio recurrente ejecutado: " + reminder.getTitle() + 
                                 " - Próximo: " + reminder.getNextTrigger());
            }
            
            reminderRepository.save(reminder);
        }
    }

    private void createNotificationFromReminder(CustomReminder reminder) {
        // 1. Crear notificación en la BD
        Notification notification = new Notification();
        notification.setUserId(reminder.getUserId());
        notification.setType(NotificationType.REMINDER_CUSTOM);
        notification.setTitle(reminder.getTitle());
        notification.setBody(reminder.getMessage());
        notification.setSeverity(Severity.INFO);
        notification.setResourceType(notificacion.models.ResourceType.SYSTEM); // Usar SYSTEM para recordatorios
        notification.setResourceId("reminder_" + reminder.getId().toString());
        notification.setCreatedAt(Instant.now());
        
        notificationRepository.save(notification);
        
        // 2. Enviar email de recordatorio
        try {
            emailService.sendReminderEmail(reminder.getUserId(), reminder);
            System.out.println("Email de recordatorio enviado para: " + reminder.getTitle());
        } catch (Exception e) {
            System.err.println("Error enviando email de recordatorio: " + e.getMessage());
        }
        
        // 3. Enviar notificación en tiempo real (WebSocket)
        try {
            notificationService.create(notification);
        } catch (Exception e) {
            System.err.println("Error enviando notificación en tiempo real: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public CustomReminder getReminder(Long reminderId, Long userId) {
        CustomReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new IllegalArgumentException("Recordatorio no encontrado"));
        
        if (!reminder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para ver este recordatorio");
        }
        
        return reminder;
    }
}
