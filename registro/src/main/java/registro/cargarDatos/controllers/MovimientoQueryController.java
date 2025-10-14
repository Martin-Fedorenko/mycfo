package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;
import registro.cargarDatos.services.MovimientoQueryService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoQueryController {

    private final MovimientoQueryService movimientoQueryService;

    /**
     * Endpoint robusto para obtener movimientos con múltiples filtros
     * 
     * @param organizacionId ID de la organización (requerido)
     * @param usuarioId ID del usuario (opcional, para filtrar por usuario creador)
     * @param fechaDesde Fecha desde (opcional)
     * @param fechaHasta Fecha hasta (opcional)
     * @param tipos Lista de tipos de movimientos (opcional, si no se especifica trae todos)
     * @param conciliado true/false para filtrar por conciliados o sin conciliar (opcional)
     * @param nombreRelacionado Buscar por nombre de cliente, proveedor, deudor, etc. (opcional)
     * @param page Número de página (default: 0)
     * @param size Tamaño de página (default: 20)
     * @param sortBy Campo por el cual ordenar (default: fechaEmision)
     * @param sortDir Dirección de orden (asc/desc, default: desc)
     */
    @GetMapping
    public ResponseEntity<Page<Movimiento>> obtenerMovimientos(
            @RequestParam Long organizacionId,
            @RequestParam(required = false) String usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) List<TipoMovimiento> tipos,
            @RequestParam(required = false) Boolean conciliado,
            @RequestParam(required = false) String nombreRelacionado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaEmision") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Movimiento> movimientos = movimientoQueryService.obtenerMovimientos(
                organizacionId,
                usuarioId,
                fechaDesde,
                fechaHasta,
                tipos,
                conciliado,
                nombreRelacionado,
                pageable
        );
        
        return ResponseEntity.ok(movimientos);
    }
}

