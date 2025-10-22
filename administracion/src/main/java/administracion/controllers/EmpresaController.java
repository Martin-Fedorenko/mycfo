package administracion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import administracion.dtos.EmpresaDTO;
import administracion.services.EmpresaService;
import administracion.services.PermissionService;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmpresaController {

    private final EmpresaService empresaService;
    private final PermissionService permissionService;

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> obtenerEmpresa(@PathVariable Long id) {
        EmpresaDTO empresa = empresaService.obtenerEmpresa(id);
        return ResponseEntity.ok(empresa);
    }

    @PostMapping
    public ResponseEntity<EmpresaDTO> crearEmpresa(@RequestBody EmpresaDTO empresaDTO) {
        EmpresaDTO creada = empresaService.crearEmpresa(empresaDTO);
        return ResponseEntity.ok(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> actualizarEmpresa(
            @RequestHeader(value = "X-Usuario-Sub") String subUsuarioActual,
            @PathVariable Long id,
            @RequestBody EmpresaDTO empresaDTO) {
        
        // Verificar permisos: solo administradores pueden editar empresa
        if (!permissionService.puedeEditarEmpresa(subUsuarioActual, id)) {
            return ResponseEntity.status(403).build();
        }
        
        EmpresaDTO actualizada = empresaService.actualizarEmpresa(id, empresaDTO);
        return ResponseEntity.ok(actualizada);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listarEmpresas() {
        List<EmpresaDTO> empresas = empresaService.listarEmpresas();
        return ResponseEntity.ok(empresas);
    }

    /**
     * Obtiene la empresa de un usuario por su sub (Cognito)
     * Este endpoint es usado por otros microservicios
     */
    @GetMapping("/usuario/{sub}")
    public ResponseEntity<EmpresaDTO> obtenerEmpresaPorUsuario(@PathVariable String sub) {
        try {
            EmpresaDTO empresa = empresaService.obtenerEmpresaPorUsuarioSub(sub);
            return ResponseEntity.ok(empresa);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene solo el ID de empresa de un usuario por su sub
     * Optimizado para llamadas rápidas desde otros microservicios
     */
    @GetMapping("/usuario/{sub}/id")
    public ResponseEntity<Long> obtenerEmpresaIdPorUsuario(@PathVariable String sub) {
        try {
            Long empresaId = empresaService.obtenerEmpresaIdPorUsuarioSub(sub);
            return ResponseEntity.ok(empresaId);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
