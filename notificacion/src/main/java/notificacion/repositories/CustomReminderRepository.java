package notificacion.repositories;

import notificacion.models.CustomReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomReminderRepository extends JpaRepository<CustomReminder, UUID> {
    
    List<CustomReminder> findByUserIdAndIsActiveTrueOrderByScheduledForAsc(Long userId);
    
    @Query("SELECT r FROM CustomReminder r WHERE r.isActive = true AND r.scheduledFor <= :now ORDER BY r.scheduledFor ASC")
    List<CustomReminder> findDueReminders(@Param("now") Instant now);
    
    @Query("SELECT r FROM CustomReminder r WHERE r.isActive = true AND r.nextTrigger <= :now ORDER BY r.nextTrigger ASC")
    List<CustomReminder> findRecurringReminders(@Param("now") Instant now);
    
    List<CustomReminder> findByUserIdAndIsActiveTrue(Long userId);
    
    void deleteByUserIdAndIsActiveFalse(Long userId);
}
