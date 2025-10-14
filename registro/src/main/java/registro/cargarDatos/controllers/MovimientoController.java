package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;
import registro.cargarDatos.services.MovimientoService;

import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoController {

    private final MovimientoService movimientoService;

    /**
     * Crear un nuevo movimiento
     */
    @PostMapping
    public ResponseEntity<Movimiento> crearMovimiento(
            @RequestBody Movimiento movimiento,
            @RequestHeader(value = "X-Usuario-Sub", required = false) String usuarioSub,
            @RequestHeader(value = "X-Organizacion-Id", required = false) String organizacionId) {
        
        // Establecer usuario y organización desde los headers
        if (usuarioSub != null) {
            movimiento.setUsuarioId(usuarioSub);
        }
        if (organizacionId != null) {
            movimiento.setOrganizacionId(Long.parseLong(organizacionId));
        }
        
        Movimiento guardado = movimientoService.guardarMovimiento(movimiento);
        return ResponseEntity.ok(guardado);
    }

    /**
     * Obtener movimientos por organización
     */
    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Movimiento>> listarPorOrganizacion(@PathVariable Long organizacionId) {
        return ResponseEntity.ok(movimientoService.listarPorOrganizacion(organizacionId));
    }

    /**
     * Obtener movimientos por tipo
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Movimiento>> listarPorTipo(@PathVariable TipoMovimiento tipo) {
        return ResponseEntity.ok(movimientoService.listarPorTipo(tipo));
    }

    /**
     * Obtener movimientos por tipo y organización
     */
    @GetMapping("/tipo/{tipo}/organizacion/{organizacionId}")
    public ResponseEntity<List<Movimiento>> listarPorTipoYOrganizacion(
            @PathVariable TipoMovimiento tipo,
            @PathVariable Long organizacionId) {
        return ResponseEntity.ok(movimientoService.listarPorTipoYOrganizacion(tipo, organizacionId));
    }

    /**
     * Obtener un movimiento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Movimiento> obtenerMovimiento(@PathVariable Long id) {
        Movimiento movimiento = movimientoService.obtenerMovimiento(id);
        if (movimiento == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(movimiento);
    }

    /**
     * Actualizar un movimiento
     */
    @PutMapping("/{id}")
    public ResponseEntity<Movimiento> actualizarMovimiento(
            @PathVariable Long id,
            @RequestBody Movimiento movimiento) {
        try {
            Movimiento actualizado = movimientoService.actualizarMovimiento(id, movimiento);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Eliminar un movimiento
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMovimiento(@PathVariable Long id) {
        movimientoService.eliminarMovimiento(id);
        return ResponseEntity.ok().build();
    }
}

