package administracion.controllers;

import administracion.services.EmpresaService;
import administracion.dtos.EmpresaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmpresaController {

    private final EmpresaService empresaService;

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> obtenerEmpresa(@PathVariable Long id) {
        try {
            EmpresaDTO empresa = empresaService.obtenerEmpresa(id);
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/")
    public ResponseEntity<List<EmpresaDTO>> listarEmpresas() {
        try {
            List<EmpresaDTO> empresas = empresaService.listarEmpresas();
            return ResponseEntity.ok(empresas);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<EmpresaDTO> crearEmpresa(@RequestBody EmpresaDTO empresaDTO) {
        try {
            EmpresaDTO empresa = empresaService.crearEmpresa(empresaDTO);
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> actualizarEmpresa(@PathVariable Long id, @RequestBody EmpresaDTO empresaDTO) {
        try {
            EmpresaDTO empresa = empresaService.actualizarEmpresa(id, empresaDTO);
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/usuario/{subUsuario}/id")
    public ResponseEntity<Long> obtenerEmpresaIdPorUsuario(@PathVariable String subUsuario) {
        try {
            System.out.println("🔍 [EMPRESA-CONTROLLER] Request recibida para obtener empresa ID del usuario: " + subUsuario);
            Long empresaId = empresaService.obtenerEmpresaIdPorUsuarioSub(subUsuario);
            System.out.println("✅ [EMPRESA-CONTROLLER] Empresa ID devuelta: " + empresaId);
            return ResponseEntity.ok(empresaId);
        } catch (Exception e) {
            System.out.println("❌ [EMPRESA-CONTROLLER] Error obteniendo empresa ID: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/debug/usuarios")
    public ResponseEntity<Map<String, Object>> debugUsuarios() {
        try {
            System.out.println("🔍 [DEBUG] Listando todos los usuarios en la base de datos...");
            
            List<administracion.models.Usuario> usuarios = empresaService.listarTodosLosUsuarios();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalUsuarios", usuarios.size());
            response.put("usuarios", usuarios.stream().map(u -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("sub", u.getSub());
                userInfo.put("nombre", u.getNombre());
                userInfo.put("email", u.getEmail());
                userInfo.put("rol", u.getRol());
                userInfo.put("activo", u.getActivo());
                userInfo.put("empresaId", u.getEmpresa() != null ? u.getEmpresa().getId() : null);
                userInfo.put("empresaNombre", u.getEmpresa() != null ? u.getEmpresa().getNombre() : null);
                return userInfo;
            }).collect(java.util.stream.Collectors.toList()));
            
            System.out.println("✅ [DEBUG] Usuarios encontrados: " + usuarios.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ [DEBUG] Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/nombre-por-usuario/{subUsuario}")
    public ResponseEntity<Map<String, String>> obtenerNombreEmpresaPorUsuario(@PathVariable String subUsuario) {
        try {
            String nombreEmpresa = empresaService.obtenerNombreEmpresaPorUsuario(subUsuario);
            if (nombreEmpresa != null) {
                return ResponseEntity.ok(Map.of("nombreEmpresa", nombreEmpresa));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}