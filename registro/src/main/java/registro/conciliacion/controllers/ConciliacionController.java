package registro.conciliacion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.conciliacion.dtos.ConciliacionRequestDTO;
import registro.conciliacion.dtos.DocumentoSugeridoDTO;
import registro.conciliacion.dtos.MovimientoDTO;
import registro.conciliacion.dtos.SugerenciasResponseDTO;
import registro.conciliacion.services.ConciliacionService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conciliacion")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConciliacionController {

    private final ConciliacionService conciliacionService;

    /**
     * Obtiene todos los movimientos sin conciliar
     */
    @GetMapping("/movimientos/sin-conciliar")
    public ResponseEntity<List<MovimientoDTO>> obtenerMovimientosSinConciliar() {
        List<MovimientoDTO> movimientos = conciliacionService.obtenerMovimientosSinConciliar();
        return ResponseEntity.ok(movimientos);
    }

    /**
     * Obtiene todos los movimientos (conciliados y sin conciliar)
     */
    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoDTO>> obtenerTodosLosMovimientos() {
        List<MovimientoDTO> movimientos = conciliacionService.obtenerTodosLosMovimientos();
        return ResponseEntity.ok(movimientos);
    }

    /**
     * Sugiere documentos para un movimiento específico
     */
    @GetMapping("/movimientos/{movimientoId}/sugerencias")
    public ResponseEntity<SugerenciasResponseDTO> obtenerSugerencias(@PathVariable Long movimientoId) {
        List<DocumentoSugeridoDTO> sugerencias = conciliacionService.sugerirDocumentos(movimientoId);
        
        // Obtener el movimiento para incluirlo en la respuesta
        List<MovimientoDTO> movimientos = conciliacionService.obtenerTodosLosMovimientos();
        MovimientoDTO movimiento = movimientos.stream()
                .filter(m -> m.getId().equals(movimientoId))
                .findFirst()
                .orElse(null);

        SugerenciasResponseDTO response = new SugerenciasResponseDTO();
        response.setMovimiento(movimiento);
        response.setSugerencias(sugerencias);
        response.setTotalSugerencias(sugerencias.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Vincula un movimiento con un documento
     */
    @PostMapping("/vincular")
    public ResponseEntity<MovimientoDTO> vincularMovimiento(@RequestBody ConciliacionRequestDTO request) {
        try {
            MovimientoDTO movimiento = conciliacionService.vincularMovimientoConDocumento(
                    request.getMovimientoId(), 
                    request.getDocumentoId()
            );
            return ResponseEntity.ok(movimiento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Desvincula un movimiento de su documento
     */
    @PostMapping("/desvincular/{movimientoId}")
    public ResponseEntity<MovimientoDTO> desvincularMovimiento(@PathVariable Long movimientoId) {
        try {
            MovimientoDTO movimiento = conciliacionService.desvincularMovimiento(movimientoId);
            return ResponseEntity.ok(movimiento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtiene estadísticas de conciliación
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        List<MovimientoDTO> todos = conciliacionService.obtenerTodosLosMovimientos();
        
        long sinConciliar = todos.stream().filter(m -> !m.getConciliado()).count();
        long conciliados = todos.stream().filter(MovimientoDTO::getConciliado).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", todos.size());
        stats.put("sinConciliar", sinConciliar);
        stats.put("conciliados", conciliados);
        stats.put("porcentajeConciliado", todos.isEmpty() ? 0 : (conciliados * 100.0 / todos.size()));

        return ResponseEntity.ok(stats);
    }
}

