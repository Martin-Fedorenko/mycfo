package notificacion.services;

import notificacion.models.Notification;
import notificacion.models.NotificationPreferences;
import notificacion.repositories.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class NotificationDigestService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferencesService preferencesService;
    private final EmailNotificationService emailService;

    public NotificationDigestService(NotificationRepository notificationRepository,
                                   NotificationPreferencesService preferencesService,
                                   EmailNotificationService emailService) {
        this.notificationRepository = notificationRepository;
        this.preferencesService = preferencesService;
        this.emailService = emailService;
    }

    // Ejecutar diariamente a las 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendDailyDigests() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Instant startOfDay = yesterday.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = yesterday.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Obtener todos los usuarios únicos que tienen notificaciones de ayer
        List<Long> userIds = notificationRepository.findDistinctUserIdsByCreatedAtBetween(startOfDay, endOfDay);

        for (Long userId : userIds) {
            NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
            if (prefs != null && prefs.isDailyDigestEnabled()) {
                List<Notification> dailyNotifications = notificationRepository
                    .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startOfDay, endOfDay);
                
                if (!dailyNotifications.isEmpty()) {
                    emailService.sendDailyDigest(userId, dailyNotifications);
                }
            }
        }
    }

    // Ejecutar semanalmente los lunes a las 9:00 AM
    @Scheduled(cron = "0 0 9 * * MON")
    @Transactional
    public void sendWeeklyDigests() {
        LocalDate weekAgo = LocalDate.now().minusWeeks(1);
        Instant startOfWeek = weekAgo.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfWeek = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Obtener todos los usuarios únicos que tienen notificaciones de la semana pasada
        List<Long> userIds = notificationRepository.findDistinctUserIdsByCreatedAtBetween(startOfWeek, endOfWeek);

        for (Long userId : userIds) {
            NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
            if (prefs != null && prefs.isWeeklyDigestEnabled()) {
                List<Notification> weeklyNotifications = notificationRepository
                    .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startOfWeek, endOfWeek);
                
                if (!weeklyNotifications.isEmpty()) {
                    emailService.sendWeeklyDigest(userId, weeklyNotifications);
                }
            }
        }
    }
}
