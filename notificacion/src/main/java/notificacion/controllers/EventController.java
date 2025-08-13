package notificacion.controllers;

import notificacion.dtos.MovementCreatedEvent;
import notificacion.services.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
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
}

