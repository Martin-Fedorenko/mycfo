package notificacion.services;

import notificacion.dtos.NotificationListResponse;
import notificacion.models.Notification;
import notificacion.repositories.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTenantFilterTest {

    @Mock
    private NotificationRepository repo;

    @Mock
    private WebSocketNotificationService webSocketService;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private NotificationService service;

    @BeforeEach
    void setup() {
        // No-op. @InjectMocks wires dependencies automatically.
    }

    @Test
    void deleteNotificationRejectsOtherTenant() {
        Notification stored = new Notification();
        stored.setId(42L);
        stored.setOrganizacionId(1L);
        stored.setUsuarioId("user-a");

        when(repo.findById(42L)).thenReturn(Optional.of(stored));

        assertThrows(IllegalArgumentException.class,
                () -> service.deleteNotification(2L, "user-b", 42L));

        verify(repo, never()).delete(any());
        verify(webSocketService, never()).sendUnreadCountUpdate(anyString(), anyInt());
    }

    @Test
    void getNotificationsUsesTenantScope() {
        Notification stored = new Notification();
        stored.setOrganizacionId(1L);
        stored.setUsuarioId("user-a");
        stored.setId(1L);
        stored.setType(notificacion.models.NotificationType.MOVEMENT_NEW);

        when(repo.findByOrganizacionIdAndUsuarioIdOrderByCreatedAtDesc(eq(1L), eq("user-a"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(stored)));
        when(repo.countByOrganizacionIdAndUsuarioIdAndIsReadFalse(1L, "user-a")).thenReturn(0);

        NotificationListResponse response = service.getNotifications(1L, "user-a", "all", 0, 10);

        assertEquals(0, response.unread());
        assertEquals(1, response.items().size());

        verify(repo).findByOrganizacionIdAndUsuarioIdOrderByCreatedAtDesc(eq(1L), eq("user-a"), any(Pageable.class));
        verify(repo, never()).findByOrganizacionIdAndUsuarioIdAndIsReadFalseOrderByCreatedAtDesc(
                any(), any(), ArgumentMatchers.<Pageable>any());
    }
}
