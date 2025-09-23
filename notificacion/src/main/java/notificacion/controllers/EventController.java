package notificacion.controllers;

import notificacion.dtos.*;
import notificacion.services.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/movements")
    public ResponseEntity<Void> onMovement(@RequestBody MovementCreatedEvent evt) {
        eventService.handleMovementCreated(evt);
        return ResponseEntity.accepted().build(); // 202
    }

    @PostMapping("/budget-exceeded")
    public ResponseEntity<Void> onBudgetExceeded(@RequestBody BudgetExceededEvent evt) {
        eventService.handleBudgetExceeded(evt);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/report-generated")
    public ResponseEntity<Void> onReportGenerated(@RequestBody ReportGeneratedEvent evt) {
        eventService.handleReportGenerated(evt);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/cashflow-alert")
    public ResponseEntity<Void> onCashFlowAlert(@RequestBody CashFlowAlertEvent evt) {
        eventService.handleCashFlowAlert(evt);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/custom-reminder")
    public ResponseEntity<Void> onCustomReminder(@RequestBody CustomReminderEvent evt) {
        eventService.handleCustomReminder(evt);
        return ResponseEntity.accepted().build();
    }
}

