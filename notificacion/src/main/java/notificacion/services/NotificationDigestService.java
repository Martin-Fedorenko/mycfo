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

    // Ejecutar cada minuto para verificar si es hora de enviar digest
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkAndSendDailyDigests() {
        System.out.println("Verificando digest diario...");
        
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Instant startOfDay = yesterday.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = yesterday.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Obtener todos los usuarios únicos que tienen notificaciones de ayer
        List<Long> userIds = notificationRepository.findDistinctUserIdsByCreatedAtBetween(startOfDay, endOfDay);
        System.out.println("Usuarios con notificaciones: " + userIds.size());

        for (Long userId : userIds) {
            NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
            if (prefs != null && prefs.isDailyDigestEnabled()) {
                // Verificar si es la hora correcta para este usuario
                LocalTime currentTime = LocalTime.now();
                LocalTime digestTime = prefs.getDigestTime();
                
                if (currentTime.getHour() == digestTime.getHour() && 
                    currentTime.getMinute() == digestTime.getMinute()) {
                    
                    List<Notification> dailyNotifications = notificationRepository
                        .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startOfDay, endOfDay);
                    
                    if (!dailyNotifications.isEmpty()) {
                        try {
                            emailService.sendDailyDigest(userId, dailyNotifications);
                            System.out.println("Digest diario enviado para usuario " + userId + " a las " + currentTime);
                        } catch (Exception e) {
                            System.err.println("Error enviando digest diario para usuario " + userId + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
        
        // También verificar digest semanal
        checkAndSendWeeklyDigests();
    }

    // Verificar digest semanal (se ejecuta junto con el diario)
    @Transactional
    public void checkAndSendWeeklyDigests() {
        System.out.println("Verificando digest semanal...");
        
        // Solo ejecutar los lunes
        if (LocalDate.now().getDayOfWeek() != java.time.DayOfWeek.MONDAY) {
            return;
        }
        
        LocalDate weekAgo = LocalDate.now().minusWeeks(1);
        Instant startOfWeek = weekAgo.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfWeek = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Obtener todos los usuarios únicos que tienen notificaciones de la semana pasada
        List<Long> userIds = notificationRepository.findDistinctUserIdsByCreatedAtBetween(startOfWeek, endOfWeek);
        System.out.println("Usuarios con notificaciones semanales: " + userIds.size());

        for (Long userId : userIds) {
            NotificationPreferences prefs = preferencesService.getPreferences(userId).orElse(null);
            if (prefs != null && prefs.isWeeklyDigestEnabled()) {
                // Verificar si es la hora correcta para este usuario
                LocalTime currentTime = LocalTime.now();
                LocalTime digestTime = prefs.getDigestTime();
                
                if (currentTime.getHour() == digestTime.getHour() && 
                    currentTime.getMinute() == digestTime.getMinute()) {
                    
                    List<Notification> weeklyNotifications = notificationRepository
                        .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, startOfWeek, endOfWeek);
                    
                    if (!weeklyNotifications.isEmpty()) {
                        try {
                            emailService.sendWeeklyDigest(userId, weeklyNotifications);
                            System.out.println("Digest semanal enviado para usuario " + userId + " a las " + currentTime);
                        } catch (Exception e) {
                            System.err.println("Error enviando digest semanal para usuario " + userId + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
    }
}
