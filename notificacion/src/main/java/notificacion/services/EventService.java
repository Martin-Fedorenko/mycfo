package notificacion.services;

import notificacion.dtos.*;
import notificacion.models.*;
import notificacion.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Service
public class EventService {

    private final NotificationRepository repo;
    private final NotificationService notificationService;

    @Value("${notifications.default-user-id:1}")
    private Long defaultUserId;

    @Value("${notifications.high-threshold:100000}")
    private BigDecimal highThreshold;

    public EventService(NotificationRepository repo,
                        NotificationService notificationService) {
        this.repo = repo;
        this.notificationService = notificationService;
    }

    @Transactional
    public void handleMovementCreated(MovementCreatedEvent evt) {
        // 0) Normalizar datos
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final String refId = Objects.requireNonNull(evt.refId(), "refId es obligatorio");
        final Instant createdAt = evt.date() != null ? evt.date() : Instant.now();
        final boolean isIncome = evt.amount() != null && evt.amount().signum() >= 0;

        // 1) Siempre: MOVEMENT_NEW (idempotente por (user,type,resourceId,día))
        saveIfNew(userId, NotificationType.MOVEMENT_NEW, refId,
                isIncome ? "Ingreso detectado" : "Egreso registrado",
                body(evt),
                Severity.INFO, createdAt);

        // 2) Umbral alto
        if (evt.amount() != null && evt.amount().abs().compareTo(highThreshold) >= 0) {
            saveIfNew(userId, NotificationType.MOVEMENT_HIGH, refId,
                    "Movimiento alto detectado", body(evt),
                    Severity.WARN, createdAt);
        }

        // 3) (opcional v2) Duplicado por monto+descripcion en ventana — lo dejamos para luego
    }

    @Transactional
    public void handleBudgetCreated(BudgetCreatedEvent evt) {
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final Long budgetId = Objects.requireNonNull(evt.budgetId(), "budgetId es obligatorio");
        final String budgetName = Objects.requireNonNull(evt.budgetName(), "budgetName es obligatorio");

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.BUDGET_CREATED);
        notification.setTitle("Presupuesto creado");
        notification.setBody("Se creo el presupuesto %s%s".formatted(
                budgetName,
                (evt.period() != null && !evt.period().isBlank()) ? " (" + evt.period() + ")" : ""
        ));
        notification.setSeverity(Severity.INFO);
        notification.setResourceType(ResourceType.BUDGET);
        notification.setResourceId(String.valueOf(budgetId));
        notification.setCreatedAt(Instant.now());
        notification.setRead(false);

        notificationService.create(notification);

        System.out.println("Notificacion creada: Presupuesto creado para usuario " + userId);
    }

    @Transactional
    public void handleBudgetExceeded(BudgetExceededEvent evt) {
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final Instant createdAt = evt.occurredAt() != null ? evt.occurredAt() : Instant.now();
        
        String title = "Presupuesto excedido: " + evt.budgetName();
        String body = String.format("Categoría: %s | Presupuestado: $%s | Real: $%s | Diferencia: $%s", 
            evt.category(), evt.budgeted(), evt.actual(), evt.variance());
        
        saveIfNew(userId, NotificationType.BUDGET_EXCEEDED, 
            "budget_" + evt.budgetId() + "_" + evt.category(),
            title, body, Severity.WARN, createdAt);
    }

    @Transactional
    public void handleReportGenerated(ReportGeneratedEvent evt) {
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final Instant createdAt = evt.generatedAt() != null ? evt.generatedAt() : Instant.now();
        
        String title = "Reporte generado: " + evt.reportName();
        String body = String.format("Tipo: %s | Período: %s", evt.reportType(), evt.period());
        
        NotificationType type = evt.hasAnomalies() ? NotificationType.REPORT_ANOMALY : NotificationType.REPORT_READY;
        Severity severity = evt.hasAnomalies() ? Severity.WARN : Severity.INFO;
        
        saveIfNew(userId, type, "report_" + evt.reportType() + "_" + evt.period(),
            title, body, severity, createdAt);
    }

    @Transactional
    public void handleCashFlowAlert(CashFlowAlertEvent evt) {
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final Instant createdAt = evt.occurredAt() != null ? evt.occurredAt() : Instant.now();
        
        String title = "Alerta de Cash Flow";
        String body = evt.message() != null ? evt.message() : 
            String.format("Balance actual: $%s | Balance pronosticado: $%s", 
                evt.currentBalance(), evt.forecastBalance());
        
        Severity severity = "NEGATIVE".equals(evt.alertType()) ? Severity.CRIT : Severity.WARN;
        
        saveIfNew(userId, NotificationType.CASH_FLOW_ALERT, 
            "cashflow_" + evt.alertType() + "_" + evt.period(),
            title, body, severity, createdAt);
    }

    @Transactional
    public void handleCustomReminder(CustomReminderEvent evt) {
        final Long userId = evt.userId() != null ? evt.userId() : defaultUserId;
        final Instant createdAt = evt.scheduledFor() != null ? evt.scheduledFor() : Instant.now();
        
        NotificationType type = NotificationType.REMINDER_CUSTOM;
        if ("DEADLINE".equals(evt.reminderType())) {
            type = NotificationType.REMINDER_DEADLINE;
        } else if ("DATA_LOAD".equals(evt.reminderType())) {
            type = NotificationType.REMINDER_DATA_LOAD;
        } else if ("BILL_DUE".equals(evt.reminderType())) {
            type = NotificationType.REMINDER_BILL_DUE;
        }
        
        saveIfNew(userId, type, "reminder_" + evt.title().hashCode(),
            evt.title(), evt.message(), Severity.INFO, createdAt);
    }

    private String body(MovementCreatedEvent e) {
        String desc = e.description() != null ? e.description() + " – " : "";
        return desc + "$" + (e.amount() != null ? e.amount() : "0");
    }

    private void saveIfNew(Long userId, NotificationType type, String resourceId,
                           String title, String body, Severity sev, Instant createdAt) {
        Instant start = createdAt.truncatedTo(ChronoUnit.DAYS);
        Instant end = start.plus(1, ChronoUnit.DAYS);

        boolean exists = repo.existsByUserIdAndTypeAndResourceIdAndCreatedAtBetween(
                userId, type, resourceId, start, end
        );
        if (exists) return;

        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setSeverity(sev);
        n.setResourceType(ResourceType.MOVEMENT);
        n.setResourceId(resourceId);
        n.setCreatedAt(createdAt);
        n.setRead(false);
        
        repo.save(n);
        
        // Log para debugging
        System.out.println("Notificación creada: " + title + " para usuario " + userId);
    }
}

