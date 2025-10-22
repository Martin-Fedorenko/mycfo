package registro.cargarDatos.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import registro.cargarDatos.models.Factura;
import registro.cargarDatos.services.FacturaService;
import registro.services.AdministracionService;

import java.util.List;

/**
 * Controlador para gestión de Facturas
 */
@RestController
@RequestMapping("/facturas")
@RequiredArgsConstructor
@Slf4j
public class FacturaController {

    private final FacturaService facturaService;
    private final AdministracionService administracionService;

    /**
     * Crear una nueva factura
     * El usuario envía el sub en el header X-Usuario-Sub
     * El sistema obtiene automáticamente el ID de empresa del usuario
     */
    @PostMapping
    public ResponseEntity<Factura> crearFactura(
            @RequestBody Factura factura,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        
        try {
            // Establecer usuario desde el header
            factura.setUsuarioId(usuarioSub);
            
            // Obtener ID de empresa automáticamente desde administración
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            factura.setOrganizacionId(empresaId);
            
            log.info("Creando factura para usuario: {} en empresa: {}", usuarioSub, empresaId);
            
            Factura guardada = facturaService.guardarFactura(factura);
            return ResponseEntity.ok(guardada);
            
        } catch (RuntimeException e) {
            log.error("Error al crear factura: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener una factura por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Factura> obtenerFactura(@PathVariable Long id) {
        Factura factura = facturaService.obtenerFactura(id);
        if (factura == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(factura);
    }

    /**
     * Listar facturas del usuario actual
     * Automáticamente filtra por la empresa del usuario
     */
    @GetMapping
    public ResponseEntity<List<Factura>> listarFacturas(
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        
        try {
            // Obtener empresa del usuario
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            
            log.debug("Obteniendo facturas para empresa: {}", empresaId);
            
            List<Factura> facturas = facturaService.listarPorOrganizacion(empresaId);
            return ResponseEntity.ok(facturas);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener facturas: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Actualizar una factura
     */
    @PutMapping("/{id}")
    public ResponseEntity<Factura> actualizarFactura(
            @PathVariable Long id,
            @RequestBody Factura factura,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        try {
            // Obtener la factura existente para verificar permisos
            Factura existente = facturaService.obtenerFactura(id);
            if (existente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verificar que el usuario tenga permisos (misma empresa)
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            if (!existente.getOrganizacionId().equals(empresaId)) {
                log.warn("Usuario {} intentó editar factura de otra empresa", usuarioSub);
                return ResponseEntity.status(403).build();
            }
            
            log.info("Actualizando factura {} para usuario: {}", id, usuarioSub);
            Factura actualizada = facturaService.actualizarFactura(id, factura);
            return ResponseEntity.ok(actualizada);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar factura {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Eliminar una factura
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFactura(
            @PathVariable Long id,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        try {
            // Obtener la factura existente para verificar permisos
            Factura existente = facturaService.obtenerFactura(id);
            if (existente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verificar que el usuario tenga permisos
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            if (!existente.getOrganizacionId().equals(empresaId)) {
                log.warn("Usuario {} intentó eliminar factura de otra empresa", usuarioSub);
                return ResponseEntity.status(403).build();
            }
            
            log.info("Eliminando factura {} para usuario: {}", id, usuarioSub);
            facturaService.eliminarFactura(id);
            return ResponseEntity.noContent().build();
            
        } catch (RuntimeException e) {
            log.error("Error al eliminar factura {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Buscar factura por número de documento
     */
    @GetMapping("/numero/{numeroDocumento}")
    public ResponseEntity<List<Factura>> buscarPorNumero(
            @PathVariable String numeroDocumento,
            @RequestHeader(value = "X-Usuario-Sub") String usuarioSub) {
        
        try {
            // Obtener empresa del usuario
            Long empresaId = administracionService.obtenerEmpresaIdPorUsuarioSub(usuarioSub);
            
            // Buscar facturas por número y filtrar por empresa
            List<Factura> facturas = facturaService.buscarPorNumeroDocumento(numeroDocumento);
            List<Factura> facturasFiltradas = facturas.stream()
                    .filter(f -> f.getOrganizacionId().equals(empresaId))
                    .toList();
            
            return ResponseEntity.ok(facturasFiltradas);
            
        } catch (RuntimeException e) {
            log.error("Error al buscar factura por número: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

