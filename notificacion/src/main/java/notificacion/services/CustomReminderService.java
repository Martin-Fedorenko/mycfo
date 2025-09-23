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
import java.util.UUID;

@Service
public class CustomReminderService {

    private final CustomReminderRepository reminderRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public CustomReminderService(CustomReminderRepository reminderRepository,
                               NotificationRepository notificationRepository,
                               NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
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
            reminder.calculateNextTrigger();
        }
        
        return reminderRepository.save(reminder);
    }

    @Transactional(readOnly = true)
    public List<CustomReminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserIdAndIsActiveTrueOrderByScheduledForAsc(userId);
    }

    @Transactional
    public void deleteReminder(UUID reminderId, Long userId) {
        CustomReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new IllegalArgumentException("Recordatorio no encontrado"));
        
        if (!reminder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para eliminar este recordatorio");
        }
        
        reminder.setActive(false);
        reminderRepository.save(reminder);
    }

    @Transactional
    public void updateReminder(UUID reminderId, Long userId, String title, String message, 
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
        
        // Procesar recordatorios únicos
        List<CustomReminder> dueReminders = reminderRepository.findDueReminders(now);
        for (CustomReminder reminder : dueReminders) {
            createNotificationFromReminder(reminder);
            reminder.setActive(false); // Marcar como completado
            reminderRepository.save(reminder);
        }
        
        // Procesar recordatorios recurrentes
        List<CustomReminder> recurringReminders = reminderRepository.findRecurringReminders(now);
        for (CustomReminder reminder : recurringReminders) {
            createNotificationFromReminder(reminder);
            reminder.markAsTriggered();
            reminderRepository.save(reminder);
        }
    }

    private void createNotificationFromReminder(CustomReminder reminder) {
        Notification notification = new Notification();
        notification.setUserId(reminder.getUserId());
        notification.setType(NotificationType.REMINDER_CUSTOM);
        notification.setTitle(reminder.getTitle());
        notification.setBody(reminder.getMessage());
        notification.setSeverity(Severity.INFO);
        notification.setResourceType(notificacion.models.ResourceType.MOVEMENT); // Usar un tipo genérico
        notification.setResourceId("reminder_" + reminder.getId().toString());
        notification.setCreatedAt(Instant.now());
        
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public CustomReminder getReminder(UUID reminderId, Long userId) {
        CustomReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new IllegalArgumentException("Recordatorio no encontrado"));
        
        if (!reminder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No autorizado para ver este recordatorio");
        }
        
        return reminder;
    }
}
