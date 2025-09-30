package notificacion.dtos;

import java.time.Instant;

public record ReportGeneratedEvent(
    Long userId,
    String reportType,
    String reportName,
    String period,
    String downloadUrl,
    Instant generatedAt,
    boolean hasAnomalies
) {}
