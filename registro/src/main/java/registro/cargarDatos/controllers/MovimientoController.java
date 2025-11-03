package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.dtos.MontosMensualesResponse;
import registro.cargarDatos.dtos.ResumenMensualResponse;
import registro.cargarDatos.dtos.MontosPorCategoriaResponse;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;
import registro.cargarDatos.services.MovimientoService;
import registro.services.AdministracionService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
@Slf4j
public class MovimientoController {

    private final MovimientoService movimientoService;
    private final AdministracionService administracionService;

    /**
     * Crear un nuevo movimiento
     * El usuario envía el sub en el header X-Usuario-Sub
     * El sistema obtiene automáticamente el ID de empresa del usuario
     */
    @PostMapping
    public ResponseEntity<Movimiento> crearMovimiento(
            @RequestBody Movimiento movimiento,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        
        try {
            // Establecer usuario desde el header
            movimiento.setUsuarioId(usuarioSub);
            
            // Obtener ID de empresa automáticamente desde administración
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            movimiento.setOrganizacionId(empresaId);
            
            log.info("Creando movimiento para usuario: {} en empresa: {}", usuarioSub, empresaId);
            
            Movimiento guardado = movimientoService.guardarMovimiento(movimiento);
            return ResponseEntity.ok(guardado);
            
        } catch (RuntimeException e) {
            log.error("Error al crear movimiento: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
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
            @RequestBody Movimiento movimiento,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        try {
            // Obtener el movimiento existente para verificar permisos
            Movimiento existente = movimientoService.obtenerMovimiento(id);
            if (existente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verificar que el usuario tenga permisos (mismo usuario o misma empresa)
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            if (!existente.getOrganizacionId().equals(empresaId)) {
                log.warn("Usuario {} intentó editar movimiento de otra empresa", usuarioSub);
                return ResponseEntity.status(403).build();
            }
            
            log.info("Actualizando movimiento {} para usuario: {}", id, usuarioSub);
            Movimiento actualizado = movimientoService.actualizarMovimiento(id, movimiento);
            return ResponseEntity.ok(actualizado);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar movimiento {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Eliminar un movimiento
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMovimiento(
            @PathVariable Long id,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        try {
            // Obtener el movimiento existente para verificar permisos
            Movimiento existente = movimientoService.obtenerMovimiento(id);
            if (existente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verificar que el usuario tenga permisos
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            if (!existente.getOrganizacionId().equals(empresaId)) {
                log.warn("Usuario {} intentó eliminar movimiento de otra empresa", usuarioSub);
                return ResponseEntity.status(403).build();
            }
            
            log.info("Eliminando movimiento {} para usuario: {}", id, usuarioSub);
            movimientoService.eliminarMovimiento(id);
            return ResponseEntity.noContent().build();
            
        } catch (RuntimeException e) {
            log.error("Error al eliminar movimiento {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener movimientos del usuario actual con filtros y paginación
     * Automáticamente filtra por la empresa del usuario
     */
    @GetMapping
    public ResponseEntity<Page<Movimiento>> obtenerMovimientos(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) List<TipoMovimiento> tipos,
            @RequestParam(required = false) Boolean conciliado,
            @RequestParam(required = false) String nombreRelacionado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaEmision") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            // Obtener empresa del usuario
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            log.debug("Obteniendo movimientos para empresa: {}", empresaId);
            
            Page<Movimiento> movimientos = movimientoService.obtenerMovimientos(
                    empresaId,
                    null, // usuarioId - null para traer todos de la empresa
                    fechaDesde,
                    fechaHasta,
                    tipos,
                    conciliado,
                    nombreRelacionado,
                    pageable
            );
            
            return ResponseEntity.ok(movimientos);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener movimientos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resumen/mensual")
    public ResponseEntity<ResumenMensualResponse> obtenerResumenMensual(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        try {
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            ResumenMensualResponse resumen = movimientoService.obtenerResumenMensual(empresaId, usuarioSub, fecha);
            return ResponseEntity.ok(resumen);
        } catch (RuntimeException e) {
            log.error("Error al obtener resumen mensual: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resumen/ingresos-mensuales")
    public ResponseEntity<MontosMensualesResponse> obtenerIngresosMensuales(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false, defaultValue = "12") Integer meses
    ) {
        try {
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            MontosMensualesResponse response = movimientoService.obtenerIngresosMensuales(
                    empresaId,
                    usuarioSub,
                    fecha,
                    meses != null ? meses : 12
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener ingresos mensuales: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resumen/egresos-mensuales")
    public ResponseEntity<MontosMensualesResponse> obtenerEgresosMensuales(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false, defaultValue = "12") Integer meses
    ) {
        try {
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            MontosMensualesResponse response = movimientoService.obtenerEgresosMensuales(
                    empresaId,
                    usuarioSub,
                    fecha,
                    meses != null ? meses : 12
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener egresos mensuales: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resumen/ingresos-categorias")
    public ResponseEntity<MontosPorCategoriaResponse> obtenerIngresosPorCategoria(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        try {
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            MontosPorCategoriaResponse response = movimientoService.obtenerIngresosPorCategoria(
                    empresaId,
                    usuarioSub,
                    fecha
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener ventas por categoría: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/resumen/egresos-categorias")
    public ResponseEntity<MontosPorCategoriaResponse> obtenerEgresosPorCategoria(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        try {
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            MontosPorCategoriaResponse response = movimientoService.obtenerEgresosPorCategoria(
                    empresaId,
                    usuarioSub,
                    fecha
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener egresos por categoria: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

}
