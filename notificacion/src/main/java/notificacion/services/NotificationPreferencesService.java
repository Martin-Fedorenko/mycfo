package notificacion.services;

import notificacion.models.NotificationPreferences;
import notificacion.models.NotificationType;
import notificacion.repositories.NotificationPreferencesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class NotificationPreferencesService {

    private final NotificationPreferencesRepository repository;

    public NotificationPreferencesService(NotificationPreferencesRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Optional<NotificationPreferences> getPreferences(Long userId) {
        return repository.findByUserId(userId);
    }

    @Transactional
    public NotificationPreferences getOrCreatePreferences(Long userId) {
        return repository.findByUserId(userId)
            .orElseGet(() -> {
                NotificationPreferences prefs = new NotificationPreferences();
                prefs.setUserId(userId);
                return repository.save(prefs);
            });
    }

    @Transactional
    public NotificationPreferences updatePreferences(Long userId, NotificationPreferences preferences) {
        NotificationPreferences existing = getOrCreatePreferences(userId);
        
        // Actualizar campos generales
        existing.setEmailEnabled(preferences.isEmailEnabled());
        existing.setInAppEnabled(preferences.isInAppEnabled());
        existing.setPushEnabled(preferences.isPushEnabled());
        existing.setQuietStart(preferences.getQuietStart());
        existing.setQuietEnd(preferences.getQuietEnd());
        existing.setQuietDays(preferences.getQuietDays());
        existing.setDailyDigestEnabled(preferences.isDailyDigestEnabled());
        existing.setWeeklyDigestEnabled(preferences.isWeeklyDigestEnabled());
        existing.setDigestTime(preferences.getDigestTime());
        existing.setUserEmail(preferences.getUserEmail()); // ✅ Agregar esta línea
        
        // Actualizar configuraciones por tipo
        if (preferences.getTypeConfigs() != null) {
            existing.getTypeConfigs().putAll(preferences.getTypeConfigs());
        }
        
        return repository.save(existing);
    }

    @Transactional
    public void updateTypePreference(Long userId, NotificationType type, 
                                   boolean enabled, boolean emailEnabled, boolean inAppEnabled) {
        NotificationPreferences prefs = getOrCreatePreferences(userId);
        prefs.getTypeConfigs().get(type).setEnabled(enabled);
        prefs.getTypeConfigs().get(type).setEmailEnabled(emailEnabled);
        prefs.getTypeConfigs().get(type).setInAppEnabled(inAppEnabled);
        repository.save(prefs);
    }

    @Transactional
    public boolean isNotificationEnabled(Long userId, NotificationType type) {
        return getPreferences(userId)
            .map(prefs -> prefs.isNotificationEnabled(type))
            .orElse(true); // Por defecto habilitado
    }

    @Transactional
    public boolean isEmailEnabled(Long userId, NotificationType type) {
        return getPreferences(userId)
            .map(prefs -> prefs.isEmailEnabled(type))
            .orElse(true); // Por defecto habilitado
    }

    @Transactional
    public boolean isInAppEnabled(Long userId, NotificationType type) {
        return getPreferences(userId)
            .map(prefs -> prefs.isInAppEnabled(type))
            .orElse(true); // Por defecto habilitado
    }

    @Transactional
    public boolean isInQuietHours(Long userId) {
        return getPreferences(userId)
            .map(NotificationPreferences::isInQuietHours)
            .orElse(false);
    }
}
