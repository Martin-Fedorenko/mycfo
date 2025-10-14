package administracion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import administracion.dtos.ActualizarUsuarioDTO;
import administracion.dtos.UsuarioDTO;
import administracion.services.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

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
            @PathVariable String sub,
            @RequestBody ActualizarUsuarioDTO dto) {
        UsuarioDTO actualizado = usuarioService.actualizarEmpleado(sub, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{sub}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable String sub) {
        usuarioService.eliminarEmpleado(sub);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{sub}/desactivar")
    public ResponseEntity<UsuarioDTO> desactivarEmpleado(@PathVariable String sub) {
        UsuarioDTO desactivado = usuarioService.desactivarEmpleado(sub);
        return ResponseEntity.ok(desactivado);
    }

    @PutMapping("/{sub}/activar")
    public ResponseEntity<UsuarioDTO> activarEmpleado(@PathVariable String sub) {
        UsuarioDTO activado = usuarioService.activarEmpleado(sub);
        return ResponseEntity.ok(activado);
    }
}
