package ia.controllers;

import ia.services.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ia")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @PostMapping("/insights")
    public ResponseEntity<Map<String, Object>> generarInsights(
            @RequestHeader("X-Usuario-Sub") String userSub,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String modo
    ) {
        var resp = insightsService.generarInsights(userSub, anio, mes, modo);
        return ResponseEntity.ok(resp);
    }
}

