package administracion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import administracion.dtos.ActualizarUsuarioDTO;
import administracion.dtos.UsuarioDTO;
import administracion.services.UsuarioService;
import administracion.services.PermissionService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PermissionService permissionService;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO> obtenerPerfil(
            @RequestHeader(value = "X-Usuario-Sub") String sub) {
        UsuarioDTO usuario = usuarioService.obtenerUsuarioPorSub(sub);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/{sub}")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable String sub) {
        UsuarioDTO usuario = usuarioService.obtenerUsuarioPorSub(sub);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> crearOActualizarUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        UsuarioDTO guardado = usuarioService.crearOActualizarUsuario(usuarioDTO);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/perfil")
    public ResponseEntity<UsuarioDTO> actualizarPerfil(
            @RequestHeader(value = "X-Usuario-Sub") String sub,
            @RequestBody ActualizarUsuarioDTO dto) {
        UsuarioDTO actualizado = usuarioService.actualizarPerfil(sub, dto);
        return ResponseEntity.ok(actualizado);
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<UsuarioDTO>> obtenerEmpleados(@PathVariable Long empresaId) {
        List<UsuarioDTO> empleados = usuarioService.obtenerEmpleadosPorEmpresa(empresaId);
        return ResponseEntity.ok(empleados);
    }

    @PutMapping("/{sub}")
    public ResponseEntity<UsuarioDTO> actualizarEmpleado(
            @RequestHeader(value = "X-Usuario-Sub") String subUsuarioActual,
            @PathVariable String sub,
            @RequestBody ActualizarUsuarioDTO dto) {
        
        // Verificar permisos: solo administradores pueden editar otros usuarios
        if (!permissionService.puedeEditarUsuario(subUsuarioActual, sub)) {
            return ResponseEntity.status(403).build();
        }
        
        UsuarioDTO actualizado = usuarioService.actualizarEmpleado(sub, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{sub}")
    public ResponseEntity<Void> eliminarEmpleado(
            @RequestHeader(value = "X-Usuario-Sub") String subUsuarioActual,
            @PathVariable String sub) {
        
        // Verificar permisos: solo administradores pueden eliminar usuarios
        if (!permissionService.esAdministrador(subUsuarioActual)) {
            return ResponseEntity.status(403).build();
        }
        
        usuarioService.eliminarEmpleado(sub);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{sub}/desactivar")
    public ResponseEntity<UsuarioDTO> desactivarEmpleado(
            @RequestHeader(value = "X-Usuario-Sub") String subUsuarioActual,
            @PathVariable String sub) {
        
        // Verificar permisos: solo administradores pueden desactivar usuarios
        if (!permissionService.esAdministrador(subUsuarioActual)) {
            return ResponseEntity.status(403).build();
        }
        
        UsuarioDTO desactivado = usuarioService.desactivarEmpleado(sub);
        return ResponseEntity.ok(desactivado);
    }

    @PutMapping("/{sub}/activar")
    public ResponseEntity<UsuarioDTO> activarEmpleado(
            @RequestHeader(value = "X-Usuario-Sub") String subUsuarioActual,
            @PathVariable String sub) {
        
        // Verificar permisos: solo administradores pueden activar usuarios
        if (!permissionService.esAdministrador(subUsuarioActual)) {
            return ResponseEntity.status(403).build();
        }
        
        UsuarioDTO activado = usuarioService.activarEmpleado(sub);
        return ResponseEntity.ok(activado);
    }
}
