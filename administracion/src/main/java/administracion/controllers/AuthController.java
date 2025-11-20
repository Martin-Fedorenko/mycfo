package administracion.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import administracion.dtos.*;
import administracion.models.Empresa;
import administracion.models.Rol;
import administracion.models.Usuario;
import administracion.repositories.EmpresaRepository;
import administracion.repositories.UsuarioRepository;
import administracion.services.CognitoService;
import administracion.services.UsuarioService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CognitoService cognitoService;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    /**
     * Registra un nuevo usuario completo (Cognito + BD)
     */
    @PostMapping("/registro")
    @Transactional
    public ResponseEntity<Map<String, String>> registrar(@RequestBody RegistroDTO dto) {
        try {
            // 1. Verificar si el email ya existe en la base de datos
            if (usuarioService.existeEmailEnBD(dto.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Este correo electrónico ya está registrado. Por favor, ingresa un correo diferente o inicia sesión.");
                return ResponseEntity.badRequest().body(error);
            }

            // 2. Verificar si el email ya existe en Cognito
            if (cognitoService.existeUsuarioEnCognito(dto.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Este correo electrónico ya está registrado en el sistema. Por favor, ingresa un correo diferente o inicia sesión.");
                return ResponseEntity.badRequest().body(error);
            }

            // 3. PRIMERO: Crear usuario en Cognito con todos los atributos
            String sub = cognitoService.registrarUsuario(
                dto.getEmail(), 
                dto.getPassword(),
                dto.getNombre(),
                dto.getApellido(),
                dto.getNombreEmpresa()
            );

            // 4. SEGUNDO: Buscar o crear empresa en BD
            Empresa empresa = empresaRepository.findByNombreIgnoreCase(dto.getNombreEmpresa())
                    .orElseGet(() -> {
                        Empresa nuevaEmpresa = new Empresa();
                        nuevaEmpresa.setNombre(dto.getNombreEmpresa());
                        nuevaEmpresa.setDescripcion("Empresa creada desde registro");
                        return empresaRepository.save(nuevaEmpresa);
                    });

            // 5. TERCERO: Crear usuario en BD
            Usuario usuario = new Usuario();
            usuario.setSub(sub);
            usuario.setNombre(dto.getNombre() + " " + dto.getApellido());
            usuario.setEmail(dto.getEmail());
            
            // Determinar rol: ADMINISTRADOR si es el primer usuario de la empresa, NORMAL si es invitación
            boolean esPrimerUsuario = usuarioRepository.countByEmpresa(empresa) == 0;
            boolean esInvitacion = dto.getEsInvitacion() != null && dto.getEsInvitacion();
            
            if (esPrimerUsuario && !esInvitacion) {
                usuario.setRol(Rol.ADMINISTRADOR); // Primer usuario de empresa nueva es administrador
            } else {
                usuario.setRol(Rol.NORMAL); // Usuarios invitados siempre son NORMAL
            }
            
            usuario.setActivo(true);
            usuario.setEmpresa(empresa);
            usuarioRepository.save(usuario);

            // 6. Retornar éxito (código enviado automáticamente por Cognito)
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Usuario registrado exitosamente. Verifica tu email para obtener el código de confirmación.");
            response.put("email", dto.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Reenvía el código de confirmación
     */
    @PostMapping("/reenviar-codigo")
    public ResponseEntity<Map<String, String>> reenviarCodigo(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            cognitoService.reenviarCodigoConfirmacion(email);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Código de confirmación reenviado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Confirma el código de verificación
     */
    @PostMapping("/confirmar")
    public ResponseEntity<Map<String, String>> confirmar(@RequestBody ConfirmarCodigoDTO dto) {
        try {
            cognitoService.confirmarRegistro(dto.getEmail(), dto.getCodigo());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Cuenta confirmada exitosamente. Ya puedes iniciar sesión.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    /**
     * Verifica si un usuario tiene perfil completo
     */
    @GetMapping("/verificar-perfil/{sub}")
    public ResponseEntity<Map<String, Boolean>> verificarPerfil(@PathVariable String sub) {
        boolean tienePerfilCompleto = usuarioService.tienePerfilCompleto(sub);
        Map<String, Boolean> response = new HashMap<>();
        response.put("perfilCompleto", tienePerfilCompleto);
        return ResponseEntity.ok(response);
    }
}

